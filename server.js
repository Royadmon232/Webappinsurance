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
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

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

// Serve static files
app.use(express.static('.', {
    index: 'index.html',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
    }
}));

// Simple auth middleware for testing
function authenticateToken(req, res, next) {
    // For testing, allow all requests
    // In production, implement proper JWT verification
    next();
}

// MongoDB connection (optional)
if (process.env.MONGODB_URI || process.env.NODE_ENV === 'production') {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
} else {
    console.log('⚠️  MongoDB not configured - running without database');
}

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
            swimmingPoolInsurance: Number
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

// Twilio setup - only if credentials are available
let twilioClient = null;
try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && 
        process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
        twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
        console.log('✅ Twilio client initialized');
    } else {
        console.log('⚠️  Twilio credentials not found or invalid - SMS functionality disabled');
    }
} catch (error) {
    console.log('⚠️  Twilio initialization failed - SMS functionality disabled:', error.message);
    twilioClient = null;
}

// Gmail API setup
const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
);

// Set credentials
if (process.env.GMAIL_REFRESH_TOKEN) {
oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});
}

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
        if (process.env.NODE_ENV === 'production' && twilioClient) {
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
        
        // Generate email content
        const emailContent = formatEmailContent(formData);
        
        // Generate PDF from the same email content
        let pdfResult = null;
        try {
            console.log('📄 Generating PDF for lead...');
            
            // Launch puppeteer browser
            const browser = await puppeteer.launch({
                headless: 'new',
                timeout: 60000, // 60 seconds timeout
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            });

            const page = await browser.newPage();
            
            // Set content with the email HTML
            await page.setContent(emailContent, {
                waitUntil: 'networkidle0'
            });

            // Generate PDF with optimized settings for Hebrew content
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in',
                    right: '0.5in'
                },
                preferCSSPageSize: true
            });

            // Close browser
            await browser.close();
            
            console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`);
            
            // Send email to agency with PDF attachment
            const filename = `lead_${formData.firstName}_${formData.lastName}_${Date.now()}.pdf`;
            
            console.log('📧📄 Sending email with PDF attachment to agency...');
            
            // Create multipart email message with PDF attachment
            const boundary = `boundary_${Date.now()}`;
            const utf8Subject = `=?utf-8?B?${Buffer.from('הצעת ביטוח דירה חדשה').toString('base64')}?=`;
            
            const messageParts = [
                `From: "אדמון סוכנות לביטוח" <royadmon23@gmail.com>`,
                `To: royadmon23@gmail.com`,
                `Reply-To: noreply@admon-agency.co.il`,
                `Subject: ${utf8Subject}`,
                'MIME-Version: 1.0',
                `Content-Type: multipart/mixed; boundary="${boundary}"`,
                '',
                `--${boundary}`,
                'Content-Type: text/html; charset=utf-8',
                'Content-Transfer-Encoding: quoted-printable',
                '',
                emailContent,
                '',
                `--${boundary}`,
                'Content-Type: application/pdf',
                `Content-Disposition: attachment; filename="${filename}"`,
                'Content-Transfer-Encoding: base64',
                '',
                pdfBuffer.toString('base64'),
                `--${boundary}--`
            ];
            
            const message = messageParts.join('\n');
            
            // Encode message in base64
            const encodedMessage = Buffer.from(message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            
            // Send email via Gmail API
            const response = await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage
                }
            });
            
            console.log('✅ Email with PDF attachment sent successfully:', response.data.id);
            
            pdfResult = {
                success: true,
                messageId: response.data.id,
                filename: filename,
                pdfSize: pdfBuffer.length
            };
            
        } catch (pdfError) {
            console.error('❌ Error generating/sending PDF:', pdfError);
            
            // Fallback: send email without PDF
            await sendEmail(
                'royadmon23@gmail.com',
                'הצעת ביטוח דירה חדשה',
                emailContent,
                'הצעת ביטוח דירה חדשה - ראה מייל HTML'
            );
            
            pdfResult = {
                success: false,
                error: 'PDF generation failed, email sent without attachment',
                message: pdfError.message
            };
        }
        
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
            formId: formData._id,
            pdf: pdfResult
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

// Send email via Gmail API
app.post('/api/send-email', async (req, res) => {
    try {
        const { to, subject, html, replyTo } = req.body;
        
        // Create email message
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
            `From: "אדמון סוכנות לביטוח" <royadmon23@gmail.com>`,
            `To: ${to}`,
            `Reply-To: ${replyTo || 'noreply@admon-agency.co.il'}`,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            html
        ];
        const message = messageParts.join('\n');
        
        // Encode message in base64
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        
        // Send email via Gmail API
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });
        
        console.log('Email sent successfully:', response.data.id);
        
        res.json({
            success: true,
            messageId: response.data.id,
            message: 'Email sent successfully'
        });
        
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send email',
            message: error.message
        });
    }
});


// Generate PDF from HTML content - kept for local development
app.post('/api/generate-pdf', async (req, res) => {
    try {
        const { htmlContent, filename, sendEmail, emailTo, emailSubject, emailHtml, formData } = req.body;
        
        // Validate required fields - support both htmlContent and formData
        if (!htmlContent && !formData) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                message: 'Please provide either htmlContent or formData field' 
            });
        }
        
        // If formData is provided, generate HTML content from it
        let finalHtmlContent = htmlContent;
        if (formData && !htmlContent) {
            finalHtmlContent = formatEmailContent(formData);
        }

        console.log('📄 Starting PDF generation...');

        // Launch puppeteer browser
        const browser = await puppeteer.launch({
            headless: 'new',
            timeout: 60000, // 60 seconds timeout
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        const page = await browser.newPage();
        
        // Set content with the beautiful HTML template
        await page.setContent(finalHtmlContent, {
            waitUntil: 'networkidle0'
        });

        // Generate PDF with optimized settings for Hebrew content
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0.5in',
                bottom: '0.5in',
                left: '0.5in',
                right: '0.5in'
            },
            preferCSSPageSize: true
        });

        // Close browser
        await browser.close();

        // Convert buffer to base64
        const base64Pdf = pdfBuffer.toString('base64');
        
        console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`);
        
        // Send email with PDF if requested
        let emailResult = null;
        const emailContent = emailHtml || finalHtmlContent;
        if (sendEmail && emailTo && emailSubject && emailContent) {
            try {
                console.log('📧📄 Sending email with PDF attachment...');
                
                // Create multipart email message with PDF attachment
                const boundary = `boundary_${Date.now()}`;
                const utf8Subject = `=?utf-8?B?${Buffer.from(emailSubject).toString('base64')}?=`;
                
                const messageParts = [
                    `From: "אדמון סוכנות לביטוח" <royadmon23@gmail.com>`,
                    `To: ${emailTo}`,
                    `Reply-To: noreply@admon-agency.co.il`,
                    `Subject: ${utf8Subject}`,
                    'MIME-Version: 1.0',
                    `Content-Type: multipart/mixed; boundary="${boundary}"`,
                    '',
                    `--${boundary}`,
                    'Content-Type: text/html; charset=utf-8',
                    'Content-Transfer-Encoding: quoted-printable',
                                    '',
                emailContent,
                '',
                    `--${boundary}`,
                    'Content-Type: application/pdf',
                    `Content-Disposition: attachment; filename="${filename || `insurance_quote_${Date.now()}.pdf`}"`,
                    'Content-Transfer-Encoding: base64',
                    '',
                    base64Pdf,
                    `--${boundary}--`
                ];
                
                const message = messageParts.join('\n');
                
                // Encode message in base64
                const encodedMessage = Buffer.from(message)
                    .toString('base64')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');
                
                // Send email via Gmail API
                const response = await gmail.users.messages.send({
                    userId: 'me',
                    requestBody: {
                        raw: encodedMessage
                    }
                });
                
                console.log('✅ Email with PDF attachment sent successfully:', response.data.id);
                emailResult = {
                    success: true,
                    messageId: response.data.id,
                    message: 'Email with PDF attachment sent successfully'
                };
                
            } catch (emailError) {
                console.error('❌ Error sending email with PDF:', emailError);
                emailResult = {
                    success: false,
                    error: 'Failed to send email with PDF',
                    message: emailError.message
                };
            }
        }
        
        // Generate filename based on form data if available
        let generatedFilename = filename;
        if (!generatedFilename && formData) {
            const customerName = `${formData.firstName || ''}_${formData.lastName || ''}`.replace(/\s+/g, '_') || 'customer';
            generatedFilename = `lead_${customerName}_${Date.now()}.pdf`;
        }
        
        res.json({
            success: true,
            filename: generatedFilename || `insurance_quote_${Date.now()}.pdf`,
            pdf: base64Pdf,
            size: pdfBuffer.length,
            message: 'PDF generated successfully',
            email: emailResult
        });
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate PDF',
            message: error.message
        });
    }
});

// Helper function to format email content
function formatEmailContent(data) {
    // Debug logging
    console.log('📊 Received formData in formatEmailContent:', JSON.stringify(data, null, 2));
    
    const formatDate = (date) => {
        if (!date) return 'לא צוין';
        return new Date(date).toLocaleDateString('he-IL', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return null;
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Make sure we have a valid submittedAt date
    if (!data.submittedAt) {
        data.submittedAt = new Date().toISOString();
    }

    // Determine which sections to show based on productType
    const productType = data.productType || '';
    const showBuilding = productType.includes('מבנה');
    const showContents = productType.includes('תכולה') || productType.includes('תוכן');
    
    const emailHtml = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ליד חדש - ביטוח דירה</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
        <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                    🏠 ליד חדש - ביטוח דירה
                </h1>
                <p style="color: #ecf0f1; margin: 10px 0 0 0; font-size: 16px;">
                    התקבלה בקשה חדשה להצעת מחיר
                </p>
            </div>

            <!-- Timestamp -->
            <div style="background-color: #ecf0f1; padding: 15px 30px; border-bottom: 2px solid #bdc3c7;">
                <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
                    <strong>תאריך ושעה:</strong> ${formatDate(data.submittedAt)} ${new Date(data.submittedAt).toLocaleTimeString('he-IL')}
                </p>
            </div>

            <!-- Main Content -->
            <div style="padding: 30px;">
                <!-- Customer Info Section -->
                <div style="background-color: #f8f9fa; border-radius: 10px; padding: 25px; margin-bottom: 25px; border-right: 4px solid #3498db;">
                    <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                        <span style="background-color: #3498db; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-left: 10px; font-size: 16px;">👤</span>
                        פרטי הלקוח
                    </h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">שם מלא</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.firstName || ''} ${data.lastName || ''}</p>
                        </div>
                        ${data.phoneNumber ? `
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">טלפון</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.phoneNumber}</p>
                        </div>
                        ` : ''}
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">דוא"ל</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.email || ''}</p>
                        </div>
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">ת.ז.</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.idNumber || ''}</p>
                        </div>
                    </div>
                </div>

                <!-- Property Info Section -->
                <div style="background-color: #f8f9fa; border-radius: 10px; padding: 25px; margin-bottom: 25px; border-right: 4px solid #e74c3c;">
                    <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                        <span style="background-color: #e74c3c; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-left: 10px; font-size: 16px;">🏠</span>
                        פרטי הנכס
                    </h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">כתובת</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">
                                ${data.street || ''} ${data.houseNumber || ''}, ${data.city || ''}

                            </p>
                        </div>
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">סוג הנכס</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.propertyType || data.assetType || ''}</p>
                        </div>
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">סוג מוצר</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.productType || ''}</p>
                        </div>
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">תאריך התחלה</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${formatDate(data.startDate)}</p>
                        </div>
                        ${data.hasGarden ? `
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">גינה</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">כן</p>
                        </div>
                        ` : ''}
                        ${data.floorCount ? `
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">מספר קומות</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.floorCount}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${data.productType === 'מבנה בלבד משועבד לבנק' && (data.selectedBank || data.selectedBranch) ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 10px 0; color: #7f8c8d; font-size: 14px; font-weight: 600;">פרטי משכנתא:</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            ${data.selectedBank ? `
                            <div>
                                <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">בנק משעבד</p>
                                <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.selectedBank}</p>
                            </div>
                            ` : ''}
                            ${data.selectedBranch ? `
                            <div>
                                <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">סניף בנק</p>
                                <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.selectedBranch}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>

                ${showBuilding && data.building ? `
                <!-- Building Insurance Details Section -->
                <div style="background-color: #f8f9fa; border-radius: 10px; padding: 25px; margin-bottom: 25px; border-right: 4px solid #f39c12;">
                    <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                        <span style="background-color: #f39c12; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-left: 10px; font-size: 16px;">🏗️</span>
                        פרטי ביטוח מבנה
                    </h2>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        ${data.building.buildingInsuranceAmount || data.building.insuranceAmount ? `
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">סכום ביטוח מבנה</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${formatCurrency(data.building.buildingInsuranceAmount || data.building.insuranceAmount)}</p>
                        </div>
                        ` : ''}
                        ${data.building.buildingAge || data.building.age ? `
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">גיל המבנה</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.building.buildingAge || data.building.age} שנים</p>
                        </div>
                        ` : ''}
                        ${data.buildingArea ? `
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">שטח המבנה</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.buildingArea} מ"ר</p>
                        </div>
                        ` : data.building && (data.building.buildingArea || data.building.area) ? `
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">שטח המבנה</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.building.buildingArea || data.building.area} מ"ר</p>
                        </div>
                        ` : ''}
                        ${data.building.constructionType ? `
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">סוג בניה</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.building.constructionType}</p>
                        </div>
                        ` : ''}
                        ${data.building.constructionStandard ? `
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">סטנדרט בניה</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.building.constructionStandard}</p>
                        </div>
                        ` : ''}
                        ${typeof data.building.mortgagedProperty !== 'undefined' ? `
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">משועבד/מוטב</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.building.mortgagedProperty ? 'כן' : 'לא'}</p>
                        </div>
                        ` : ''}
                        ${data.building.loanEndDate ? `
                        <div>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">תאריך סיום ההלוואה האחרונה</p>
                            <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${formatDate(data.building.loanEndDate)}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${(data.building.waterDamageType || data.building.earthquakeCoverage || data.building.burglaryBuilding) ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 10px 0; color: #7f8c8d; font-size: 14px; font-weight: 600;">כיסויים למבנה:</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            ${data.building.waterDamageType ? `<span style="background-color: #3498db; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">נזקי מים: ${data.building.waterDamageType}</span>` : ''}
                            ${data.building.burglaryBuilding ? `<span style="background-color: #3498db; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">פריצה</span>` : ''}
                            ${data.building.earthquakeCoverage && data.building.earthquakeCoverage !== 'לא' ? `<span style="background-color: #3498db; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">רעידת אדמה: ${data.building.earthquakeCoverage}</span>` : ''}
                            ${data.building.waterDeductible ? `<span style="background-color: #95a5a6; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">השתתפות עצמית: ${data.building.waterDeductible}</span>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${(data.building.buildingContentsInsurance || data.building.storageInsurance || data.building.swimmingPoolInsurance) ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 10px 0; color: #7f8c8d; font-size: 14px; font-weight: 600;">הרחבות מבנה:</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            ${data.building.buildingContentsInsurance ? `
                            <div>
                                <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">תכולת מבנה</p>
                                <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${formatCurrency(data.building.buildingContentsInsurance)}</p>
                            </div>
                            ` : ''}
                            ${data.building.storageInsurance ? `
                            <div>
                                <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">מחסן</p>
                                <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${formatCurrency(data.building.storageInsurance)}</p>
                            </div>
                            ` : ''}
                            ${data.building.swimmingPoolInsurance ? `
                            <div>
                                <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">בריכת שחיה</p>
                                <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${formatCurrency(data.building.swimmingPoolInsurance)}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                ${showContents && data.contents && (data.contents.jewelryAmount || data.contents.watchesAmount) ? `
                <!-- Contents Insurance Details Section -->
                <div style="background-color: #f8f9fa; border-radius: 10px; padding: 25px; margin-bottom: 25px; border-right: 4px solid #9b59b6;">
                    <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                        <span style="background-color: #9b59b6; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-left: 10px; font-size: 16px;">📦</span>
                        פרטי ביטוח תכולה
                    </h2>
                    
                    ${data.contents.contentsBuildingAge || data.contents.buildingAge ? `
                    <div style="margin-bottom: 15px;">
                        <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">גיל המבנה לתכולה</p>
                        <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${data.contents.contentsBuildingAge || data.contents.buildingAge} שנים</p>
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 20px;">
                        <p style="margin: 0 0 10px 0; color: #7f8c8d; font-size: 14px; font-weight: 600;">דברי ערך:</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            ${data.contents.jewelryAmount ? `
                            <div>
                                <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">תכשיטים</p>
                                <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${formatCurrency(data.contents.jewelryAmount)}</p>
                            </div>
                            ` : ''}
                            ${data.contents.watchesAmount ? `
                            <div>
                                <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">שעונים</p>
                                <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${formatCurrency(data.contents.watchesAmount)}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${data.contents.contentsEarthquakeCoverage ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 10px 0; color: #7f8c8d; font-size: 14px; font-weight: 600;">כיסויים לתכולה:</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            <span style="background-color: #3498db; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">רעידת אדמה: ${data.contents.contentsEarthquakeCoverage}</span>
                        </div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                ${data.additionalCoverage && (data.additionalCoverage.thirdPartyCoverage || 
                   data.additionalCoverage.employersLiability || data.additionalCoverage.cyberCoverage || 
                   data.additionalCoverage.terrorCoverage || data.additionalCoverage.businessEmployers ||
                   data.additionalCoverage.businessThirdParty) ? `
                <!-- Additional Coverage Section -->
                <div style="background-color: #f8f9fa; border-radius: 10px; padding: 25px; margin-bottom: 25px; border-right: 4px solid #27ae60;">
                    <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                        <span style="background-color: #27ae60; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-left: 10px; font-size: 16px;">📋</span>
                        כיסויים נוספים
                    </h2>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${data.additionalCoverage.businessEmployers ? '<span style="background-color: #27ae60; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">חבות מעבידים עסקית</span>' : ''}
                        ${data.additionalCoverage.businessThirdParty ? '<span style="background-color: #27ae60; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">צד ג\' עסקי</span>' : ''}
                        ${data.additionalCoverage.thirdPartyCoverage ? '<span style="background-color: #27ae60; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">צד שלישי</span>' : ''}
                        ${data.additionalCoverage.employersLiability ? '<span style="background-color: #27ae60; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">חבות מעבידים</span>' : ''}
                        ${data.additionalCoverage.cyberCoverage ? '<span style="background-color: #27ae60; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">סייבר למשפחה</span>' : ''}
                        ${data.additionalCoverage.terrorCoverage ? '<span style="background-color: #27ae60; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">טרור</span>' : ''}
                    </div>
                </div>
                ` : ''}

                <!-- Additional Notes -->
                ${data.notes || data.additionalNotes ? `
                <div style="background-color: #fff3cd; border-radius: 10px; padding: 20px; margin-bottom: 25px; border-right: 4px solid #f39c12;">
                    <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">
                        📝 הערות נוספות
                    </h3>
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                        ${data.notes || data.additionalNotes}
                    </p>
                </div>
                ` : ''}

                <!-- Action Buttons -->
                <div style="text-align: center; margin-top: 30px;">
                    <a href="tel:${data.phoneNumber || ''}" style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 0 10px;">
                        📞 חייג ללקוח
                    </a>
                    <a href="mailto:${data.email || ''}" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 0 10px;">
                        📧 שלח הצעה
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #34495e; padding: 20px 30px; text-align: center;">
                <p style="color: #ecf0f1; margin: 0; font-size: 14px;">
                    ליד זה נשלח ממערכת הלידים של סוכנות הביטוח
                </p>
                <p style="color: #95a5a6; margin: 5px 0 0 0; font-size: 12px;">
                    © 2024 אדמון סוכנות לביטוח - כל הזכויות שמורות
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
    server.close(() => {
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