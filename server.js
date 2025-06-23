const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
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

// Gmail API setup
const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
);

// Set credentials
oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Helper function to send email via Gmail API
async function sendEmail(to, subject, htmlContent, textContent) {
    try {
        const message = [
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `To: ${to}`,
            `Subject: ${subject}`,
            '',
            htmlContent
        ].join('\n');

        const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        console.log('Email sent successfully:', res.data.id);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

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
        
        await sendEmail(
            'royadmon23@gmail.com',
            'הצעת ביטוח דירה חדשה',
            emailContent,
            'הצעת ביטוח דירה חדשה - ראה מייל HTML'
        );
        
        // Send confirmation email to customer
        if (formData.email) {
            const customerEmailHtml = `
                    <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
                        <h2>שלום ${formData.firstName} ${formData.lastName},</h2>
                        <p>קיבלנו את בקשתך לביטוח דירה.</p>
                        <p>נציג מטעמנו יצור איתך קשר בתוך 24 שעות עם הצעת מחיר מותאמת אישית.</p>
                        <br>
                        <p>בברכה,<br>צוות אדמון סוכנות לביטוח</p>
                    </div>
            `;
            
            await sendEmail(
                formData.email,
                'אישור קבלת בקשה לביטוח דירה - אדמון סוכנות לביטוח',
                customerEmailHtml,
                `שלום ${formData.firstName} ${formData.lastName}, קיבלנו את בקשתך לביטוח דירה. נציג מטעמנו יצור איתך קשר בתוך 24 שעות.`
            );
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
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('he-IL', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const emailHtml = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; direction: rtl; text-align: right; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 800px; margin: 20px auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0052cc 0%, #003d99 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">📋 ליד חדש - הצעת ביטוח דירה</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">אדמון סוכנות לביטוח</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
                <!-- Summary Box -->
                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-right: 4px solid #0052cc;">
                    <h2 style="margin: 0 0 10px 0; color: #0052cc;">📊 סיכום בקשה</h2>
                    <p style="margin: 5px 0;"><strong>שם הלקוח:</strong> ${data.firstName} ${data.lastName}</p>
                    <p style="margin: 5px 0;"><strong>סוג ביטוח:</strong> ${data.productType}</p>
                    <p style="margin: 5px 0;"><strong>תאריך התחלה מבוקש:</strong> ${formatDate(data.startDate)}</p>
                    <p style="margin: 5px 0;"><strong>תאריך קבלת הבקשה:</strong> ${formatDate(data.submittedAt)}</p>
                </div>

                <!-- Personal Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">👤 פרטים אישיים</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>שם מלא:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.firstName} ${data.lastName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>טלפון:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.phoneNumber}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>אימייל:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>תעודת זהות:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">[מוצפן בבסיס הנתונים]</td>
                        </tr>
                    </table>
                </div>

                <!-- Property Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">🏠 פרטי הנכס</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>סוג נכס:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.propertyType}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>כתובת:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.address.street} ${data.address.houseNumber}, ${data.address.city}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>מיקוד:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.address.postalCode}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>גינה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.address.hasGarden ? '✅ כן' : '❌ לא'}</td>
                        </tr>
                    </table>
                </div>

                ${data.building ? `
                <!-- Building Insurance Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">🏗️ ביטוח מבנה</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #fff3cd;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>סכום ביטוח:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0; font-size: 18px; color: #0052cc;"><strong>${formatCurrency(data.building.insuranceAmount)}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>גיל המבנה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.age} שנים</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>שטח:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.area} מ"ר</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>סוג בניה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.constructionType}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>סטנדרט בניה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.constructionStandard}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>משועבד/מוטב:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.mortgagedProperty ? '✅ כן' : '❌ לא'}</td>
                        </tr>
                        ${data.building.renewals ? `
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>חידושים:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.renewals}</td>
                        </tr>
                        ` : ''}
                    </table>

                    <!-- Building Coverages -->
                    <h4 style="margin-top: 20px; color: #333;">כיסויים:</h4>
                    <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        <li style="padding: 5px 0;">${data.building.waterDamageType ? '💧 ' + data.building.waterDamageType : '❌ ללא נזקי מים'}</li>
                        ${data.building.waterDeductible ? `<li style="padding: 5px 0;">💰 השתתפות עצמית: ${data.building.waterDeductible}</li>` : ''}
                        <li style="padding: 5px 0;">${data.building.burglary ? '🔒 פריצה גניבה ושוד' : '❌ ללא כיסוי פריצה'}</li>
                        <li style="padding: 5px 0;">${data.building.earthquakeCoverage === 'כן' ? '🌍 רעידת אדמה' : '❌ ללא כיסוי רעידת אדמה'}</li>
                        ${data.building.earthquakeDeductible ? `<li style="padding: 5px 0;">💰 השתתפות עצמית רעידת אדמה: ${data.building.earthquakeDeductible}</li>` : ''}
                    </ul>

                    ${data.building.extensions && Object.values(data.building.extensions).some(v => v) ? `
                    <h4 style="margin-top: 20px; color: #333;">הרחבות:</h4>
                    <ul style="background: #e8f5e9; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${data.building.extensions.buildingContentsInsurance > 0 ? `<li style="padding: 5px 0;">🏠 תכולת דירה שבבניין משותף: ${formatCurrency(data.building.extensions.buildingContentsInsurance)}</li>` : ''}
                        ${data.building.extensions.storageInsurance > 0 ? `<li style="padding: 5px 0;">📦 מחסן: ${formatCurrency(data.building.extensions.storageInsurance)}</li>` : ''}
                        ${data.building.extensions.swimmingPoolInsurance > 0 ? `<li style="padding: 5px 0;">🏊 בריכת שחייה: ${formatCurrency(data.building.extensions.swimmingPoolInsurance)}</li>` : ''}
                        ${data.building.extensions.glassBreakageInsurance > 0 ? `<li style="padding: 5px 0;">🪟 שבר שמשות: ${formatCurrency(data.building.extensions.glassBreakageInsurance)}</li>` : ''}
                        ${data.building.extensions.boilersCoverage ? `<li style="padding: 5px 0;">♨️ דוודים</li>` : ''}
                    </ul>
                    ` : ''}
                </div>
                ` : ''}

                ${data.contents ? `
                <!-- Contents Insurance Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">📦 ביטוח תכולה</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #fff3cd;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>סכום ביטוח:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0; font-size: 18px; color: #0052cc;"><strong>${formatCurrency(data.contents.insuranceAmount)}</strong></td>
                        </tr>
                        ${data.contents.jewelry.amount > 0 ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>תכשיטים:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${formatCurrency(data.contents.jewelry.amount)} - ${data.contents.jewelry.coverage || 'ללא כיסוי נוסף'}</td>
                        </tr>
                        ` : ''}
                        ${data.contents.watches.amount > 0 ? `
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>שעונים:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${formatCurrency(data.contents.watches.amount)} - ${data.contents.watches.coverage || 'ללא כיסוי נוסף'}</td>
                        </tr>
                        ` : ''}
                    </table>

                    ${data.contents.valuableItems && Object.values(data.contents.valuableItems).some(v => v > 0) ? `
                    <h4 style="margin-top: 20px; color: #333;">דברי ערך בכל הסיכונים:</h4>
                    <ul style="background: #e8f5e9; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${data.contents.valuableItems.cameras > 0 ? `<li style="padding: 5px 0;">📷 מצלמות: ${formatCurrency(data.contents.valuableItems.cameras)}</li>` : ''}
                        ${data.contents.valuableItems.electronics > 0 ? `<li style="padding: 5px 0;">💻 ציוד אלקטרוני: ${formatCurrency(data.contents.valuableItems.electronics)}</li>` : ''}
                        ${data.contents.valuableItems.bicycles > 0 ? `<li style="padding: 5px 0;">🚲 אופניים: ${formatCurrency(data.contents.valuableItems.bicycles)}</li>` : ''}
                        ${data.contents.valuableItems.musicalInstruments > 0 ? `<li style="padding: 5px 0;">🎸 כלי נגינה: ${formatCurrency(data.contents.valuableItems.musicalInstruments)}</li>` : ''}
                    </ul>
                    ` : ''}

                    <!-- Contents Coverages -->
                    <h4 style="margin-top: 20px; color: #333;">כיסויים:</h4>
                    <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        <li style="padding: 5px 0;">${data.contents.coverages.waterDamage ? '💧 נזקי מים (תכולה בלבד)' : '❌ ללא נזקי מים'}</li>
                        <li style="padding: 5px 0;">${data.contents.coverages.burglary ? '🔒 פריצה גניבה ושוד' : '❌ ללא כיסוי פריצה'}</li>
                        <li style="padding: 5px 0;">${data.contents.coverages.earthquake === 'כן' ? '🌍 רעידת אדמה' : '❌ ללא כיסוי רעידת אדמה'}</li>
                        ${data.contents.coverages.earthquakeDeductible ? `<li style="padding: 5px 0;">💰 השתתפות עצמית רעידת אדמה: ${data.contents.coverages.earthquakeDeductible}</li>` : ''}
                    </ul>
                </div>
` : ''}

                ${data.additionalCoverages && Object.values(data.additionalCoverages).some(v => v) ? `
                <!-- Additional Coverages -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">➕ כיסויים נוספים</h3>
                    <ul style="background: #f0f8ff; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${data.additionalCoverages.businessContents > 0 ? `<li style="padding: 5px 0;">💼 תכולה עסקית: ${formatCurrency(data.additionalCoverages.businessContents)}</li>` : ''}
                        ${data.additionalCoverages.businessEmployers ? `<li style="padding: 5px 0;">👔 פעילות עסקית (מעבידים)</li>` : ''}
                        ${data.additionalCoverages.businessThirdParty ? `<li style="padding: 5px 0;">🤝 תכולה עסקית (צד ג')</li>` : ''}
                        ${data.additionalCoverages.thirdPartyCoverage ? `<li style="padding: 5px 0;">⚖️ כיסוי צד שלישי</li>` : ''}
                        ${data.additionalCoverages.employersLiability ? `<li style="padding: 5px 0;">👥 חבות מעבידים</li>` : ''}
                        ${data.additionalCoverages.cyberCoverage ? `<li style="padding: 5px 0;">🔒 כיסוי סייבר למשפחה</li>` : ''}
                        ${data.additionalCoverages.terrorCoverage ? `<li style="padding: 5px 0;">🛡️ כיסוי לטרור</li>` : ''}
                    </ul>
                </div>
` : ''}

                <!-- Action Required -->
                <div style="background: #ffebee; padding: 20px; border-radius: 8px; border-right: 4px solid #f44336; margin-top: 30px;">
                    <h3 style="margin: 0 0 10px 0; color: #d32f2f;">⚡ פעולה נדרשת</h3>
                    <p style="margin: 0;">יש ליצור קשר עם הלקוח בתוך 24 שעות להצעת מחיר מותאמת אישית.</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                    הודעה זו נשלחה ממערכת הלידים של אדמון סוכנות לביטוח<br>
                    ${formatDate(data.submittedAt)}
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    return emailHtml;
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