// Import shared verification codes storage
const { setVerificationData, getVerificationData, getStorageStats } = require('./verification-storage');

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
        
        console.log(`Generated verification code for ${email}: "${code}" (type: ${typeof code})`);
        
        // Store the code (expires in 10 minutes)
        await setVerificationData(email, {
            code: String(code), // Ensure it's stored as string
            expires: Date.now() + 10 * 60 * 1000,
            attempts: 0
        });
        
        console.log(`Stored verification data for ${email}:`, {
            code: String(code),
            expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            attempts: 0
        });

        // Verify it was actually stored
        const storedData = await getVerificationData(email);
        console.log(`Verification: Code stored successfully for ${email}:`, storedData);

        // Check if N8N webhook URL is configured
        if (!process.env.N8N_WEBHOOK_URL) {
            console.error('N8N_WEBHOOK_URL is not configured');
            return res.status(500).json({
                error: 'Email service is not configured',
                details: 'N8N webhook URL is missing'
            });
        }

        console.log('Sending verification code to N8N webhook:', process.env.N8N_WEBHOOK_URL);

        // Prepare email HTML content (compact format to avoid JSON parsing issues)
        const emailHtml = `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family: Arial, sans-serif;direction: rtl;text-align: right;background-color: #f5f5f5;margin: 0;padding: 20px;}.container{max-width: 600px;margin: 0 auto;background-color: white;border-radius: 10px;overflow: hidden;box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);}.header{background: linear-gradient(135deg, #013369, #0052cc);color: white;padding: 30px;text-align: center;}.header h1{margin: 0;font-size: 24px;}.content{padding: 30px;}.verification-code{background-color: #f8f9ff;border: 2px solid #013369;border-radius: 8px;padding: 20px;text-align: center;margin: 20px 0;}.code{font-size: 32px;font-weight: bold;color: #013369;letter-spacing: 4px;margin: 10px 0;}.warning{color: #e74c3c;font-size: 14px;margin-top: 20px;}.footer{background-color: #f8f9fa;padding: 20px;text-align: center;color: #666;font-size: 14px;}</style></head><body><div class="container"><div class="header"><h1>אדמון סוכנות לביטוח</h1><p>קוד אימות לביטוח דירה</p></div><div class="content"><h2>שלום,</h2><p>קיבלנו בקשה לאימות כתובת האימייל שלך עבור הצעת ביטוח דירה.</p><div class="verification-code"><p><strong>קוד האימות שלך:</strong></p><div class="code">${code}</div><p>הזן קוד זה באתר כדי להמשיך</p></div><p>הקוד תקף למשך 10 דקות.</p><div class="warning"><strong>חשוב:</strong> אם לא ביקשת קוד זה, אנא התעלם מהמייל הזה.</div></div><div class="footer"><p>אדמון סוכנות לביטוח - הסוכנות המובילה בישראל</p><p>טלפון: 050-931-3531 | אימייל: info@admon-insurance.co.il</p></div></div></body></html>`;

        // Send to N8N webhook for email delivery via Amazon SES
        const requestBody = {
            email: email,
            code: code,
            subject: 'קוד אימות - אדמון סוכנות לביטוח',
            htmlContent: emailHtml,
            timestamp: new Date().toISOString()
        };

        console.log('Sending request to N8N with data length:', JSON.stringify(requestBody).length);

        const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!n8nResponse.ok) {
            const errorText = await n8nResponse.text();
            console.error('N8N webhook failed:', n8nResponse.status, errorText);
            throw new Error(`N8N webhook failed: ${n8nResponse.status}`);
        }

        const responseData = await n8nResponse.json();
        console.log(`Verification code sent successfully via N8N for ${email}:`, responseData);

        // Get storage info for debugging
        const debugInfo = await getStorageStats();

        res.status(200).json({
            success: true,
            message: 'Verification code sent successfully',
            debug: debugInfo // Always include debug info for now
        });

    } catch (error) {
        console.error('Error sending email verification code:', error);
        res.status(500).json({
            error: 'Failed to send verification code',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 