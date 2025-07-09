const AWS = require('aws-sdk');
const { google } = require('googleapis');

// Import shared verification codes storage
const { setVerificationData } = require('./verification-storage');

// Configure AWS SES
const ses = new AWS.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'eu-north-1'
});

// Gmail OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

// Set credentials if we have a refresh token
if (process.env.GMAIL_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });
}

// Initialize Gmail API
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send email via Gmail API to agent
async function sendToAgent(email, code) {
    try {
        const subject = 'קוד אימות נשלח ללקוח - אדמון סוכנות לביטוח';
        const html = `
            <!DOCTYPE html>
            <html dir="rtl" lang="he">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #013369; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .info-box { background: white; padding: 15px; margin: 10px 0; border-right: 4px solid #013369; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>התראה - קוד אימות נשלח ללקוח</h2>
                    </div>
                    <div class="content">
                        <div class="info-box">
                            <strong>כתובת אימייל הלקוח:</strong> ${email}
                        </div>
                        <div class="info-box">
                            <strong>קוד האימות שנשלח:</strong> ${code}
                        </div>
                        <div class="info-box">
                            <strong>זמן שליחה:</strong> ${new Date().toLocaleString('he-IL')}
                        </div>
                        <p>קוד זה תקף למשך 10 דקות.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Create email message for Gmail API
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
            `From: "אדמון סוכנות לביטוח" <royadmon23@gmail.com>`,
            `To: royadmon23@gmail.com`,
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
        
        // Send email via Gmail API if configured
        if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
            const response = await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage
                }
            });
            console.log('Email sent to agent via Gmail API:', response.data.id);
        } else {
            console.log('Gmail API not configured - agent notification skipped');
        }
    } catch (error) {
        console.error('Error sending email to agent:', error);
        // Don't fail the main request if agent notification fails
    }
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        console.log(`Processing email verification request for: ${email}`);

        // Generate 6-digit verification code
        const code = generateVerificationCode();
        
        // Store the code (expires in 10 minutes)
        setVerificationData(email, {
            code,
            expires: Date.now() + 10 * 60 * 1000,
            attempts: 0
        });

        console.log(`Generated verification code ${code} for ${email}`);

        // Track which services succeeded
        const results = {
            amazonSES: false,
            n8nWebhook: false,
            gmailAgent: false
        };

        // 1. Send verification code to customer via Amazon SES
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            try {
                const params = {
                    Source: '"אדמון סוכנות לביטוח" <noreply@amazonses.com>',
                    Destination: {
                        ToAddresses: [email]
                    },
                    Message: {
                        Subject: {
                            Data: 'קוד אימות - אדמון סוכנות לביטוח',
                            Charset: 'UTF-8'
                        },
                        Body: {
                            Html: {
                                Data: `
                                    <!DOCTYPE html>
                                    <html dir="rtl" lang="he">
                                    <head>
                                        <meta charset="UTF-8">
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        <style>
                                            body {
                                                font-family: Arial, sans-serif;
                                                direction: rtl;
                                                text-align: right;
                                                background-color: #f5f5f5;
                                                margin: 0;
                                                padding: 20px;
                                            }
                                            .container {
                                                max-width: 600px;
                                                margin: 0 auto;
                                                background-color: white;
                                                border-radius: 10px;
                                                overflow: hidden;
                                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                            }
                                            .header {
                                                background: linear-gradient(135deg, #013369, #0052cc);
                                                color: white;
                                                padding: 30px;
                                                text-align: center;
                                            }
                                            .header h1 {
                                                margin: 0;
                                                font-size: 24px;
                                            }
                                            .content {
                                                padding: 30px;
                                            }
                                            .verification-code {
                                                background-color: #f8f9ff;
                                                border: 2px solid #013369;
                                                border-radius: 8px;
                                                padding: 20px;
                                                text-align: center;
                                                margin: 20px 0;
                                            }
                                            .code {
                                                font-size: 32px;
                                                font-weight: bold;
                                                color: #013369;
                                                letter-spacing: 4px;
                                                margin: 10px 0;
                                            }
                                            .warning {
                                                color: #e74c3c;
                                                font-size: 14px;
                                                margin-top: 20px;
                                            }
                                            .footer {
                                                background-color: #f8f9fa;
                                                padding: 20px;
                                                text-align: center;
                                                color: #666;
                                                font-size: 14px;
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="container">
                                            <div class="header">
                                                <h1>אדמון סוכנות לביטוח</h1>
                                                <p>קוד אימות לביטוח דירה</p>
                                            </div>
                                            <div class="content">
                                                <h2>שלום,</h2>
                                                <p>קיבלנו בקשה לאימות כתובת האימייל שלך עבור הצעת ביטוח דירה.</p>
                                                
                                                <div class="verification-code">
                                                    <p><strong>קוד האימות שלך:</strong></p>
                                                    <div class="code">${code}</div>
                                                    <p>הזן קוד זה באתר כדי להמשיך</p>
                                                </div>
                                                
                                                <p>הקוד תקף למשך 10 דקות.</p>
                                                
                                                <div class="warning">
                                                    <strong>חשוב:</strong> אם לא ביקשת קוד זה, אנא התעלם מהמייל הזה.
                                                </div>
                                            </div>
                                            <div class="footer">
                                                <p>אדמון סוכנות לביטוח - הסוכנות המובילה בישראל</p>
                                                <p>טלפון: 050-931-3531 | אימייל: info@admon-insurance.co.il</p>
                                            </div>
                                        </div>
                                    </body>
                                    </html>
                                `,
                                Charset: 'UTF-8'
                            }
                        }
                    }
                };

                await ses.sendEmail(params).promise();
                results.amazonSES = true;
                console.log(`Email verification code sent to ${email} via Amazon SES`);
            } catch (sesError) {
                console.error('Amazon SES error:', sesError);
                // Continue with other methods
            }
        } else {
            console.log('Amazon SES not configured - skipping SES email');
        }

        // 2. Send to N8N webhook (for N8N automation)
        if (process.env.N8N_WEBHOOK_URL) {
            try {
                const response = await fetch(process.env.N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        code: code,
                        timestamp: new Date().toISOString(),
                        action: 'email_verification_sent'
                    })
                });

                if (response.ok) {
                    results.n8nWebhook = true;
                    console.log(`Verification code sent to N8N for ${email}`);
                } else {
                    console.error(`N8N webhook responded with status: ${response.status}`);
                }
            } catch (n8nError) {
                console.error('Failed to send to N8N webhook:', n8nError);
                // Continue with other methods
            }
        } else {
            console.log('N8N webhook URL not configured - skipping N8N notification');
        }

        // 3. Send notification to agent via Gmail API
        try {
            await sendToAgent(email, code);
            results.gmailAgent = true;
        } catch (agentError) {
            console.error('Failed to send agent notification:', agentError);
            // Continue - this is not critical
        }

        // Check if at least one method succeeded
        const successfulMethods = Object.values(results).filter(Boolean).length;
        
        if (successfulMethods === 0) {
            throw new Error('All email services failed');
        }

        console.log(`Email verification completed. Success: SES=${results.amazonSES}, N8N=${results.n8nWebhook}, Agent=${results.gmailAgent}`);

        res.status(200).json({
            success: true,
            message: 'Verification code sent successfully',
            methods: results
        });

    } catch (error) {
        console.error('Error in email verification process:', error);
        res.status(500).json({
            error: 'Failed to send verification code',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
}; 