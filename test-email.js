require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
    console.log('Testing SMTP configuration...');
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        // Send test email
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER, // Send to yourself
            subject: 'בדיקת מערכת אימות - אדמון סוכנות לביטוח',
            html: `
                <div style="direction: rtl; text-align: right; font-family: Arial;">
                    <h2>בדיקת מערכת SMTP</h2>
                    <p>אם אתה רואה את המייל הזה, המערכת עובדת בהצלחה! 🎉</p>
                    <p>קוד בדיקה: <strong>123456</strong></p>
                </div>
            `
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        
    } catch (error) {
        console.log('❌ SMTP Error:', error.message);
        console.log('Check your .env file settings');
    }
}

testSMTP(); 