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
                    <p style="margin: 5px 0;"><strong>שם הלקוח:</strong> ${data.firstName || ''} ${data.lastName || ''}</p>
                    <p style="margin: 5px 0;"><strong>סוג ביטוח:</strong> ${data.productType || 'לא צוין'}</p>
                    <p style="margin: 5px 0;"><strong>תאריך התחלה מבוקש:</strong> ${formatDate(data.startDate)}</p>
                    <p style="margin: 5px 0;"><strong>תאריך קבלת הבקשה:</strong> ${formatDate(data.submittedAt)}</p>
                </div>

                <!-- Personal Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">👤 פרטים אישיים</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>שם מלא:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.firstName || ''} ${data.lastName || ''}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>טלפון:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.phoneNumber || 'לא צוין'}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>אימייל:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.email || 'לא צוין'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>תעודת זהות:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.idNumber || '[מוצפן בבסיס הנתונים]'}</td>
                        </tr>
                    </table>
                </div>

                <!-- Property Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">🏠 פרטי הנכס</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>סוג נכס:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.propertyType || 'לא צוין'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>כתובת:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${(data.address?.street || data.street || '')} ${(data.address?.houseNumber || data.houseNumber || '')}, ${(data.address?.city || data.city || '')}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>מיקוד:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${(data.address?.postalCode || data.postalCode || 'לא צוין')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>גינה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${(data.address?.hasGarden || data.hasGarden) ? '✅ כן' : '❌ לא'}</td>
                        </tr>
                    </table>
                </div>

                ${data.building && data.building.insuranceAmount ? `
                <!-- Building Insurance Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">🏗️ ביטוח מבנה</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #fff3cd;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>סכום ביטוח:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0; font-size: 18px; color: #0052cc;"><strong>${formatCurrency(data.building.insuranceAmount)}</strong></td>
                        </tr>
                        ${data.building.buildingAge || data.building.age ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>גיל המבנה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.buildingAge || data.building.age} שנים</td>
                        </tr>
                        ` : ''}
                        ${data.building.area ? `
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>שטח מבנה בנוי:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.area} מ"ר</td>
                        </tr>
                        ` : ''}
                        ${data.building.hasTerrace === 'כן' ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>מרפסת:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">✅ כן${data.building.terraceArea ? ` - ${data.building.terraceArea} מ"ר` : ''}</td>
                        </tr>
                        ` : data.building.hasTerrace === 'לא' ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>מרפסת:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">❌ לא</td>
                        </tr>
                        ` : ''}
                        ${data.building.hasGarden === 'כן' ? `
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>גינה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">✅ כן${data.building.gardenArea ? ` - ${data.building.gardenArea} מ"ר` : ''}</td>
                        </tr>
                        ` : data.building.hasGarden === 'לא' ? `
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>גינה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">❌ לא</td>
                        </tr>
                        ` : ''}
                        ${data.building.roofType ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>סוג גג:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.roofType}</td>
                        </tr>
                        ` : ''}
                        ${data.building.constructionType ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>סוג בניה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.constructionType}</td>
                        </tr>
                        ` : ''}

                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>משועבד/מוטב:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${(data.building.mortgagedProperty || data.building.mortgaged) ? '✅ כן' : '❌ לא'}</td>
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
                        <li style="padding: 5px 0;">${data.building.earthquakeCoverage === 'כן' ? '🌍 רעידת אדמה' : '❌ ללא כיסוי רעידת אדמה'}</li>
                        ${data.building.earthquakeDeductible ? `<li style="padding: 5px 0;">💰 השתתפות עצמית רעידת אדמה: ${data.building.earthquakeDeductible}</li>` : ''}
                        ${data.building.earthquakeLandCoverage === 'כן' ? `<li style="padding: 5px 0;">🏢 כיסוי שווי קרקע מרעידת אדמה${data.building.earthquakeCoverageAmount ? `: ${formatCurrency(data.building.earthquakeCoverageAmount)}` : ''}</li>` : ''}
                    </ul>

                    ${(data.building.buildingContentsInsurance || data.building.storageInsurance || data.building.hasSwimmingPool) ? `
                    <h4 style="margin-top: 20px; color: #333;">הרחבות:</h4>
                    <ul style="background: #e8f5e9; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${data.building.buildingContentsInsurance ? `<li style="padding: 5px 0;">🏠 תכולת דירה שבבניין משותף: ${formatCurrency(data.building.buildingContentsInsurance)}</li>` : ''}
                        ${data.building.storageInsurance ? `<li style="padding: 5px 0;">📦 מחסן: ${formatCurrency(data.building.storageInsurance)}</li>` : ''}
                        ${data.building.hasSwimmingPool ? `<li style="padding: 5px 0;">🏊 בריכת שחיה${data.building.swimmingPoolValue ? `: שווי ${formatCurrency(data.building.swimmingPoolValue)}` : ''}</li>` : ''}
                    </ul>
                    ` : ''}
                </div>
                ` : ''}

                ${data.contents && (data.contents.jewelryAmount || data.contents.watchesAmount || 
                   data.contents.camerasAmount || data.contents.electronicsAmount || 
                   data.contents.bicyclesAmount || data.contents.musicalInstrumentsAmount) ? `
                <!-- Contents Insurance Details -->
                        ${data.contents.earthquakeCoverage ? `<li style="padding: 5px 0;">🌍 רעידת אדמה (תכולה): ${data.contents.earthquakeCoverage}</li>` : ""}                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">📦 ביטוח תכולה</h3>
                    ${data.contents.contentsBuildingAge ? `
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>גיל המבנה לתכולה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.contents.contentsBuildingAge} שנים</td>
                        </tr>
                    </table>
                    ` : ''}

                    ${(data.contents.jewelryAmount || data.contents.watchesAmount || data.contents.camerasAmount || data.contents.electronicsAmount || data.contents.bicyclesAmount || data.contents.musicalInstrumentsAmount) ? `
                    <h4 style="margin-top: 20px; color: #333;">דברי ערך בכל הסיכונים:</h4>
                    <ul style="background: #e8f5e9; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${data.contents.jewelryAmount ? `<li style="padding: 5px 0;">💎 תכשיטים: ${formatCurrency(data.contents.jewelryAmount)} ${data.contents.jewelryCoverage ? ` - ${data.contents.jewelryCoverage}` : ''}</li>` : ''}
                        ${data.contents.watchesAmount ? `<li style="padding: 5px 0;">⌚ שעונים: ${formatCurrency(data.contents.watchesAmount)} ${data.contents.watchesCoverage ? ` - ${data.contents.watchesCoverage}` : ''}</li>` : ''}
                        ${data.contents.camerasAmount ? `<li style="padding: 5px 0;">📷 מצלמות: ${formatCurrency(data.contents.camerasAmount)}</li>` : ''}
                        ${data.contents.electronicsAmount ? `<li style="padding: 5px 0;">💻 ציוד אלקטרוני: ${formatCurrency(data.contents.electronicsAmount)}</li>` : ''}
                        ${data.contents.bicyclesAmount ? `<li style="padding: 5px 0;">🚲 אופניים: ${formatCurrency(data.contents.bicyclesAmount)}</li>` : ''}
                        ${data.contents.musicalInstrumentsAmount ? `<li style="padding: 5px 0;">🎸 כלי נגינה: ${formatCurrency(data.contents.musicalInstrumentsAmount)}</li>` : ''}
                    </ul>
                    ` : ''}

                    ${data.contents.contentsWaterDamage !== undefined ? `
                    <!-- Contents Coverages -->
                    <h4 style="margin-top: 20px; color: #333;">כיסויים:</h4>
                    <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        <li style="padding: 5px 0;">${data.contents.contentsWaterDamage ? '💧 נזקי מים (תכולה בלבד)' : '❌ ללא נזקי מים'}</li>
                    </ul>
                    ` : ''}
                </div>
                ` : ''}

                ${data.additionalCoverage && Object.values(data.additionalCoverage).some(v => v) ? `
                <!-- Additional Coverages -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">➕ כיסויים נוספים</h3>
                    <ul style="background: #f0f8ff; padding: 15px 30px; border-radius: 5px; list-style: none;">

                        ${data.additionalCoverage.businessEmployers ? `<li style="padding: 5px 0;">👔 פעילות עסקית (מעבידים)</li>` : ''}
                        ${data.additionalCoverage.businessThirdParty ? `<li style="padding: 5px 0;">🤝 תכולה עסקית (צד ג')</li>` : ''}
                        ${data.additionalCoverage.thirdPartyCoverage ? `<li style="padding: 5px 0;">⚖️ כיסוי צד שלישי</li>` : ''}
                        ${data.additionalCoverage.employersLiability ? `<li style="padding: 5px 0;">👥 חבות מעבידים</li>` : ''}
                        ${data.additionalCoverage.cyberCoverage ? `<li style="padding: 5px 0;">🔒 כיסוי סייבר למשפחה</li>` : ''}
                        ${data.additionalCoverage.terrorCoverage ? `<li style="padding: 5px 0;">🛡️ כיסוי לטרור</li>` : ''}
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