const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

const smsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5 // limit each IP to 5 SMS requests per hour
});

app.use('/api/', limiter);
app.use('/api/send-verification', smsLimiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Mongoose schemas
const verificationCodeSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^0\d{2}-?\d{7}$/.test(v);
            },
            message: 'Invalid Israeli phone number format'
        }
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Code expires after 10 minutes
    },
    attempts: {
        type: Number,
        default: 0
    }
});

const insuranceFormSchema = new mongoose.Schema({
    // Personal details
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { 
        type: String, 
        required: true,
        validate: [validator.isEmail, 'Invalid email address']
    },
    phoneNumber: { type: String, required: true },
    idNumber: { type: String, required: true },
    
    // Insurance details
    productType: { type: String, required: true },
    propertyType: { type: String, required: true },
    startDate: { type: Date, required: true },
    
    // Address
    address: {
        city: String,
        street: String,
        houseNumber: String,
        postalCode: String,
        hasGarden: Boolean
    },
    
    // Building details
    building: {
        insuranceAmount: Number,
        age: Number,
        area: Number,
        constructionType: String,
        constructionStandard: String,
        mortgagedProperty: Boolean,
        renewals: String,
        waterDamageType: String,
        waterDeductible: String,
        burglary: Boolean,
        earthquakeCoverage: String,
        earthquakeDeductible: String,
        additionalSharedInsurance: Number,
        extensions: {
            buildingContentsInsurance: Number,
            storageInsurance: Number,
            swimmingPoolInsurance: Number,
            glassBreakageInsurance: Number,
            boilersCoverage: Boolean
        }
    },
    
    // Contents details
    contents: {
        insuranceAmount: Number,
        buildingAge: Number,
        jewelry: {
            amount: Number,
            coverage: String
        },
        watches: {
            amount: Number,
            coverage: String
        },
        valuableItems: {
            cameras: Number,
            electronics: Number,
            bicycles: Number,
            musicalInstruments: Number
        },
        coverages: {
            waterDamage: Boolean,
            burglary: Boolean,
            earthquake: String,
            earthquakeDeductible: String
        }
    },
    
    // Additional coverages
    additionalCoverages: {
        businessContents: Number,
        businessEmployers: Boolean,
        businessThirdParty: Boolean,
        thirdPartyCoverage: Boolean,
        employersLiability: Boolean,
        cyberCoverage: Boolean,
        terrorCoverage: Boolean
    },
    
    // Metadata
    submittedAt: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['pending', 'contacted', 'quoted', 'completed'],
        default: 'pending'
    }
});

// Add encryption for sensitive data
insuranceFormSchema.pre('save', async function(next) {
    // Encrypt ID number
    if (this.idNumber && this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.idNumber = await bcrypt.hash(this.idNumber, salt);
    }
    next();
});

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);
const InsuranceForm = mongoose.model('InsuranceForm', insuranceFormSchema);

// Twilio setup
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Helper function to generate verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// API Routes

// Send verification code
app.post('/api/send-verification', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        // Validate phone number
        if (!phoneNumber || !/^0\d{2}-?\d{7}$/.test(phoneNumber)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }
        
        // Generate code
        const code = generateVerificationCode();
        
        // Save to database
        await VerificationCode.findOneAndUpdate(
            { phoneNumber },
            { code, attempts: 0 },
            { upsert: true, new: true }
        );
        
        // Send SMS
        if (process.env.NODE_ENV === 'production') {
            await twilioClient.messages.create({
                body: `קוד האימות שלך לביטוח דירה הוא: ${code}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: `+972${phoneNumber.substring(1).replace('-', '')}`
            });
        } else {
            console.log(`Verification code for ${phoneNumber}: ${code}`);
        }
        
        res.json({ success: true, message: 'Verification code sent' });
        
    } catch (error) {
        console.error('Error sending verification code:', error);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
});

// Verify code
app.post('/api/verify-code', async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;
        
        // Find verification record
        const verification = await VerificationCode.findOne({ phoneNumber });
        
        if (!verification) {
            return res.status(400).json({ error: 'No verification code found' });
        }
        
        // Check attempts
        if (verification.attempts >= 3) {
            return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
        }
        
        // Verify code
        if (verification.code !== code) {
            verification.attempts += 1;
            await verification.save();
            return res.status(400).json({ error: 'Invalid verification code' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { phoneNumber, verified: true },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );
        
        // Delete verification record
        await VerificationCode.deleteOne({ phoneNumber });
        
        res.json({ success: true, token });
        
    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({ error: 'Failed to verify code' });
    }
});

// Submit insurance form
app.post('/api/submit-form', async (req, res) => {
    try {
        // Verify JWT token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No authorization token' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (!decoded.verified) {
            return res.status(401).json({ error: 'Phone number not verified' });
        }
        
        // Save form data
        const formData = new InsuranceForm(req.body);
        formData.phoneNumber = decoded.phoneNumber;
        await formData.save();
        
        // Send email to agency
        const emailContent = formatEmailContent(formData);
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'royadmon23@gmail.com',
            subject: 'הצעת ביטוח דירה חדשה',
            text: emailContent,
            html: emailContent.replace(/\n/g, '<br>')
        });
        
        // Send confirmation email to customer
        if (formData.email) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: formData.email,
                subject: 'אישור קבלת בקשה לביטוח דירה - אדמון סוכנות לביטוח',
                html: `
                    <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
                        <h2>שלום ${formData.firstName} ${formData.lastName},</h2>
                        <p>קיבלנו את בקשתך לביטוח דירה.</p>
                        <p>נציג מטעמנו יצור איתך קשר בתוך 24 שעות עם הצעת מחיר מותאמת אישית.</p>
                        <br>
                        <p>בברכה,<br>צוות אדמון סוכנות לביטוח</p>
                    </div>
                `
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Form submitted successfully',
            formId: formData._id 
        });
        
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

// Get form status (for tracking)
app.get('/api/form-status/:formId', async (req, res) => {
    try {
        const form = await InsuranceForm.findById(req.params.formId).select('status submittedAt');
        
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        
        res.json({ 
            status: form.status,
            submittedAt: form.submittedAt
        });
        
    } catch (error) {
        console.error('Error getting form status:', error);
        res.status(500).json({ error: 'Failed to get form status' });
    }
});

// Helper function to format email content
function formatEmailContent(data) {
    return `
פרטי הצעת ביטוח דירה חדשה
========================

פרטים אישיים:
--------------
שם מלא: ${data.firstName} ${data.lastName}
מספר טלפון: ${data.phoneNumber}
אימייל: ${data.email}
תעודת זהות: [מוצפן]

פרטי הביטוח:
--------------
סוג מוצר: ${data.productType}
סוג נכס: ${data.propertyType}
תאריך התחלה: ${new Date(data.startDate).toLocaleDateString('he-IL')}

כתובת:
-------
עיר: ${data.address.city}
רחוב: ${data.address.street}
מספר בית: ${data.address.houseNumber}
מיקוד: ${data.address.postalCode}
גינה: ${data.address.hasGarden ? 'כן' : 'לא'}

${data.building.insuranceAmount ? `
פרטי מבנה:
-----------
סכום ביטוח: ₪${data.building.insuranceAmount.toLocaleString('he-IL')}
גיל המבנה: ${data.building.age} שנים
שטח: ${data.building.area} מ"ר
סוג בניה: ${data.building.constructionType}
סטנדרט בניה: ${data.building.constructionStandard}
משועבד/מוטב: ${data.building.mortgagedProperty ? 'כן' : 'לא'}
` : ''}

${data.contents.insuranceAmount ? `
פרטי תכולה:
-----------
סכום ביטוח: ₪${data.contents.insuranceAmount.toLocaleString('he-IL')}
תכשיטים: ₪${(data.contents.jewelry.amount || 0).toLocaleString('he-IL')}
שעונים: ₪${(data.contents.watches.amount || 0).toLocaleString('he-IL')}
` : ''}

נשלח בתאריך: ${new Date(data.submittedAt).toLocaleString('he-IL')}
    `;
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    app.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

// MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`
    🚀 Server is running!
    🔊 Listening on port ${PORT}
    📱 Frontend: http://localhost:8080
    🔌 API: http://localhost:${PORT}
    🌍 Environment: ${process.env.NODE_ENV || 'development'}
    `);
});

module.exports = { app, server }; 