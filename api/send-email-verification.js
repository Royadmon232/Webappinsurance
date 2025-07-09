const AWS = require('aws-sdk');

// Import shared verification codes storage
const { setVerificationData } = require('./verification-storage');

// Configure AWS SES
const ses = new AWS.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'eu-north-1'
});

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

        // Generate 6-digit verification code
        const code = generateVerificationCode();
        
        // Store the code (expires in 10 minutes)
        setVerificationData(email, {
            code,
            expires: Date.now() + 10 * 60 * 1000,
            attempts: 0
        });

        // Email parameters for Amazon SES
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

        // Send email via Amazon SES
        await ses.sendEmail(params).promise();

        console.log(`Email verification code sent to ${email}: ${code}`);

        // Send to N8N webhook (if configured)
        if (process.env.N8N_WEBHOOK_URL) {
            try {
                await fetch(process.env.N8N_WEBHOOK_URL, {
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
                console.log(`Verification code sent to N8N for ${email}`);
            } catch (n8nError) {
                console.log('Failed to send to N8N webhook:', n8nError.message);
                // Don't fail the main request if N8N fails
            }
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent successfully'
        });

    } catch (error) {
        console.error('Error sending email verification code:', error);
        res.status(500).json({
            error: 'Failed to send verification code',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 