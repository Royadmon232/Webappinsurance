/**
 * PDF Generation and Email Sending API for Vercel
 * יצירת PDF ושליחת מייל עם Gmail API
 * 
 * This endpoint generates a PDF from form data and sends it via email
 * הנתיב הזה יוצר PDF מנתוני הטופס ושולח אותו למייל
 */

import puppeteer from 'puppeteer';
import { google } from 'googleapis';

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

// Helper function to format email content (same as in server.js)
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
                        ${data.building.extensions.terrorism ? '<li style="padding: 5px 0;">💥 טרור</li>' : ''}
                        ${data.building.extensions.personalAccident ? '<li style="padding: 5px 0;">🚑 תאונות אישיות</li>' : ''}
                        ${data.building.extensions.lossOfRent ? '<li style="padding: 5px 0;">🏠 אובדן שכר דירה</li>' : ''}
                        ${data.building.extensions.alternativeAccommodation ? '<li style="padding: 5px 0;">🏨 לינה חלופית</li>' : ''}
                        ${data.building.extensions.keyReplacement ? '<li style="padding: 5px 0;">🔑 החלפת מנעולים</li>' : ''}
                        ${data.building.extensions.debris ? '<li style="padding: 5px 0;">🗑️ פינוי הריסות</li>' : ''}
                        ${data.building.extensions.professionalFees ? '<li style="padding: 5px 0;">💼 שכר מקצועי</li>' : ''}
                        ${data.building.extensions.rentReduction ? '<li style="padding: 5px 0;">📉 הפחתת שכר דירה</li>' : ''}
                        ${data.building.extensions.governmentFees ? '<li style="padding: 5px 0;">🏛️ אגרות רשויות</li>' : ''}
                        ${data.building.extensions.upgrades ? '<li style="padding: 5px 0;">⬆️ שיפורים ושדרוגים</li>' : ''}
                    </ul>
                    ` : ''}
                </div>
                ` : ''}

                ${data.contents ? `
                <!-- Contents Insurance Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">🛋️ ביטוח תוכן</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #fff3cd;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>סכום ביטוח:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0; font-size: 18px; color: #0052cc;"><strong>${formatCurrency(data.contents.insuranceAmount)}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>תכשיטים:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${formatCurrency(data.contents.jewelry)}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>מכשירים אלקטרוניים:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${formatCurrency(data.contents.electronics)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>ריהוט:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${formatCurrency(data.contents.furniture)}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>אחר:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${formatCurrency(data.contents.other)}</td>
                        </tr>
                    </table>

                    <!-- Contents Coverages -->
                    <h4 style="margin-top: 20px; color: #333;">כיסויים:</h4>
                    <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        <li style="padding: 5px 0;">${data.contents.waterDamage ? '💧 נזקי מים' : '❌ ללא נזקי מים'}</li>
                        <li style="padding: 5px 0;">${data.contents.burglary ? '🔒 פריצה גניבה ושוד' : '❌ ללא כיסוי פריצה'}</li>
                        <li style="padding: 5px 0;">${data.contents.fire ? '🔥 שריפה' : '❌ ללא כיסוי שריפה'}</li>
                        <li style="padding: 5px 0;">${data.contents.earthquake ? '🌍 רעידת אדמה' : '❌ ללא כיסוי רעידת אדמה'}</li>
                    </ul>

                    ${data.contents.extensions && Object.values(data.contents.extensions).some(v => v) ? `
                    <h4 style="margin-top: 20px; color: #333;">הרחבות:</h4>
                    <ul style="background: #e8f5e9; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${data.contents.extensions.terrorism ? '<li style="padding: 5px 0;">💥 טרור</li>' : ''}
                        ${data.contents.extensions.personalAccident ? '<li style="padding: 5px 0;">🚑 תאונות אישיות</li>' : ''}
                        ${data.contents.extensions.temporaryAccommodation ? '<li style="padding: 5px 0;">🏨 לינה זמנית</li>' : ''}
                        ${data.contents.extensions.refrigeratorContents ? '<li style="padding: 5px 0;">❄️ תכולת מקרר</li>' : ''}
                        ${data.contents.extensions.personalBelongings ? '<li style="padding: 5px 0;">🎒 חפצים אישיים מחוץ לבית</li>' : ''}
                        ${data.contents.extensions.identityTheft ? '<li style="padding: 5px 0;">🆔 גניבת זהות</li>' : ''}
                        ${data.contents.extensions.computerData ? '<li style="padding: 5px 0;">💻 מידע ממוחשב</li>' : ''}
                        ${data.contents.extensions.creditCards ? '<li style="padding: 5px 0;">💳 כרטיסי אשראי</li>' : ''}
                        ${data.contents.extensions.cashAndDocuments ? '<li style="padding: 5px 0;">💰 כסף ומסמכים</li>' : ''}
                    </ul>
                    ` : ''}
                </div>
                ` : ''}

                ${data.liability ? `
                <!-- Liability Insurance Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">🛡️ ביטוח צד ג'</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #fff3cd;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>סכום ביטוח:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0; font-size: 18px; color: #0052cc;"><strong>${formatCurrency(data.liability.insuranceAmount)}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>עובדים:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.liability.hasEmployees ? '✅ כן' : '❌ לא'}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>חיות מחמד:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.liability.hasPets ? '✅ כן' : '❌ לא'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>בריכה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.liability.hasSwimmingPool ? '✅ כן' : '❌ לא'}</td>
                        </tr>
                    </table>

                    ${data.liability.extensions && Object.values(data.liability.extensions).some(v => v) ? `
                    <h4 style="margin-top: 20px; color: #333;">הרחבות:</h4>
                    <ul style="background: #e8f5e9; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${data.liability.extensions.personalAccident ? '<li style="padding: 5px 0;">🚑 תאונות אישיות</li>' : ''}
                        ${data.liability.extensions.employerLiability ? '<li style="padding: 5px 0;">👨‍💼 אחריות מעבידים</li>' : ''}
                        ${data.liability.extensions.tenantLiability ? '<li style="padding: 5px 0;">🏠 אחריות שוכרים</li>' : ''}
                        ${data.liability.extensions.keysLiability ? '<li style="padding: 5px 0;">🔑 אחריות מפתחות</li>' : ''}
                        ${data.liability.extensions.elevatorLiability ? '<li style="padding: 5px 0;">🛗 אחריות מעלית</li>' : ''}
                        ${data.liability.extensions.emergencyExpenses ? '<li style="padding: 5px 0;">🚨 הוצאות חירום</li>' : ''}
                        ${data.liability.extensions.professionalLiability ? '<li style="padding: 5px 0;">💼 אחריות מקצועית</li>' : ''}
                    </ul>
                    ` : ''}
                </div>
                ` : ''}

                <!-- Footer -->
                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #666;">
                    <p style="margin: 5px 0;"><strong>תאריך יצירת הליד:</strong> ${formatDate(new Date())}</p>
                    <p style="margin: 5px 0;">📞 טלפון: 03-1234567 | 📧 אימייל: info@admon-agency.co.il</p>
                    <p style="margin: 5px 0; font-size: 14px;">אדמון סוכנות לביטוח - שירות מקצועי ואמין</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    return emailHtml;
}

// Send email with PDF attachment via Gmail API
async function sendEmailWithPdf(to, subject, htmlContent, pdfBuffer, filename) {
    try {
        console.log('📧📄 Sending email with PDF attachment via Gmail API...');
        
        // Create multipart email message with PDF attachment
        const boundary = `boundary_${Date.now()}`;
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        
        const messageParts = [
            `From: "אדמון סוכנות לביטוח" <royadmon23@gmail.com>`,
            `To: ${to}`,
            `Reply-To: noreply@admon-agency.co.il`,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: text/html; charset=utf-8',
            'Content-Transfer-Encoding: quoted-printable',
            '',
            htmlContent,
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
        return {
            success: true,
            messageId: response.data.id,
            message: 'Email with PDF attachment sent successfully'
        };
        
    } catch (error) {
        console.error('❌ Error sending email with PDF:', error);
        return {
            success: false,
            error: 'Failed to send email with PDF',
            message: error.message
        };
    }
}

// Generate PDF from HTML content
async function generatePdf(htmlContent) {
    try {
        console.log('📄 Starting PDF generation...');
        
        // Launch puppeteer browser
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // Set content with the beautiful HTML template
        await page.setContent(htmlContent, {
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
        return pdfBuffer;
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        throw error;
    }
}

// Main API handler
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
            message: 'Only POST requests are allowed'
        });
    }
    
    try {
        const { 
            formData,
            sendEmail, 
            emailTo, 
            emailSubject
        } = req.body;
        
        // Validate required fields
        if (!formData) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields',
                message: 'Please provide formData field with lead information' 
            });
        }
        
        // Generate HTML content from form data
        const htmlContent = formatEmailContent(formData);
        
        // Generate PDF
        const pdfBuffer = await generatePdf(htmlContent);
        
        // Convert buffer to base64
        const base64Pdf = pdfBuffer.toString('base64');
        
        // Send email with PDF if requested
        let emailResult = null;
        if (sendEmail && emailTo && emailSubject) {
            // Check if Gmail API is configured
            if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
                emailResult = {
                    success: false,
                    error: 'Gmail service not available',
                    message: 'Gmail API credentials not configured'
                };
            } else {
                const filename = `lead_${formData.firstName}_${formData.lastName}_${Date.now()}.pdf`;
                emailResult = await sendEmailWithPdf(
                    emailTo,
                    emailSubject,
                    htmlContent,
                    pdfBuffer,
                    filename
                );
            }
        }
        
        // Return success response
        res.status(200).json({
            success: true,
            filename: `lead_${formData.firstName}_${formData.lastName}_${Date.now()}.pdf`,
            pdf: base64Pdf,
            size: pdfBuffer.length,
            message: 'PDF generated successfully',
            email: emailResult
        });
        
    } catch (error) {
        console.error('❌ API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
} 