/**
 * PDF Generation and Email Sending API for Vercel
 * יצירת PDF ושליחת מייל עם Gmail API
 * 
 * This endpoint generates a PDF from form data and sends it via email
 * הנתיב הזה יוצר PDF מנתוני הטופס ושולח אותו למייל
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
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
                        ${data.phoneNumber ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>טלפון:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.phoneNumber}</td>
                        </tr>
                        ` : ''}
                        ${data.email ? `
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>אימייל:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.email}</td>
                        </tr>
                        ` : ''}
                        ${data.idNumber ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>תעודת זהות:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.idNumber}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>

                <!-- Property Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">🏠 פרטי הנכס</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${data.propertyType ? `
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>סוג נכס:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.propertyType}</td>
                        </tr>
                        ` : ''}
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>כתובת:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">
                                ${data.street || ''} ${data.houseNumber || ''}, ${data.city || ''}
                            </td>
                        </tr>
                        ${data.postalCode ? `
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>מיקוד:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.postalCode}</td>
                        </tr>
                        ` : ''}
                        ${typeof data.hasGarden !== 'undefined' ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>גינה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.hasGarden ? '✅ כן' : '❌ לא'}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>

                ${showBuilding && data.building && (data.building.insuranceAmount || data.building.buildingInsuranceAmount) ? `
                <!-- Building Insurance Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">🏗️ ביטוח מבנה</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #fff3cd;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>סכום ביטוח:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0; font-size: 18px; color: #0052cc;"><strong>${formatCurrency(data.building.insuranceAmount || data.building.buildingInsuranceAmount)}</strong></td>
                        </tr>
                        ${data.building.age || data.building.buildingAge ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>גיל המבנה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.age || data.building.buildingAge} שנים</td>
                        </tr>
                        ` : ''}
                        ${data.building.area || data.building.buildingArea ? `
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>שטח:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.area || data.building.buildingArea} מ"ר</td>
                        </tr>
                        ` : ''}
                        ${data.building.constructionType ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>סוג בניה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.constructionType}</td>
                        </tr>
                        ` : ''}
                        ${data.building.constructionStandard ? `
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>סטנדרט בניה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.constructionStandard}</td>
                        </tr>
                        ` : ''}
                        ${typeof (data.building.mortgagedProperty || data.building.mortgaged) !== 'undefined' ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>משועבד/מוטב:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${(data.building.mortgagedProperty || data.building.mortgaged) ? '✅ כן' : '❌ לא'}</td>
                        </tr>
                        ` : ''}
                        ${data.building.renewals ? `
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>חידושים:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.building.renewals}</td>
                        </tr>
                        ` : ''}
                    </table>

                    <!-- Building Coverages - Only if they exist -->
                    ${data.building.waterDamageType || data.building.earthquakeCoverage || 
                      (typeof data.building.burglaryBuilding !== 'undefined') ? `
                    <h4 style="margin-top: 20px; color: #333;">כיסויים:</h4>
                    <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${data.building.waterDamageType ? `<li style="padding: 5px 0;">💧 ${data.building.waterDamageType}</li>` : ''}
                        ${data.building.waterDeductible ? `<li style="padding: 5px 0;">💰 השתתפות עצמית נזקי מים: ${data.building.waterDeductible}</li>` : ''}
                        ${typeof data.building.burglaryBuilding !== 'undefined' ? `<li style="padding: 5px 0;">${data.building.burglaryBuilding ? '🔒 פריצה גניבה ושוד' : '❌ ללא כיסוי פריצה'}</li>` : ''}
                        ${data.building.earthquakeCoverage ? `<li style="padding: 5px 0;">${data.building.earthquakeCoverage === 'כן' ? '🌍 רעידת אדמה' : '❌ ללא כיסוי רעידת אדמה'}</li>` : ''}
                        ${data.building.earthquakeDeductible ? `<li style="padding: 5px 0;">💰 השתתפות עצמית רעידת אדמה: ${data.building.earthquakeDeductible}</li>` : ''}
                    </ul>
                    ` : ''}

                    <!-- Additional Building Amounts - Only if they exist -->
                    ${(data.building.buildingContentsInsurance || data.building.storageInsurance || 
                       data.building.swimmingPoolInsurance || data.building.glassBreakageInsurance ||
                       data.building.additionalSharedInsurance || data.building.boilersCoverage) ? `
                    <h4 style="margin-top: 20px; color: #333;">סכומים נוספים:</h4>
                    <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${data.building.buildingContentsInsurance ? `<li style="padding: 5px 0;">📦 תכולת מבנה: ${formatCurrency(data.building.buildingContentsInsurance)}</li>` : ''}
                        ${data.building.storageInsurance ? `<li style="padding: 5px 0;">🏚️ מחסן: ${formatCurrency(data.building.storageInsurance)}</li>` : ''}
                        ${data.building.swimmingPoolInsurance ? `<li style="padding: 5px 0;">🏊 בריכת שחייה: ${formatCurrency(data.building.swimmingPoolInsurance)}</li>` : ''}
                        ${data.building.glassBreakageInsurance ? `<li style="padding: 5px 0;">🪟 שבר זכוכית: ${formatCurrency(data.building.glassBreakageInsurance)}</li>` : ''}
                        ${data.building.additionalSharedInsurance ? `<li style="padding: 5px 0;">🏢 רכוש משותף נוסף: ${formatCurrency(data.building.additionalSharedInsurance)}</li>` : ''}
                        ${data.building.boilersCoverage ? '<li style="padding: 5px 0;">♨️ דודי חימום: כלול</li>' : ''}
                    </ul>
                    ` : ''}
                </div>
                ` : ''}

                ${showContents && data.contents && (data.contents.insuranceAmount || data.contents.contentsInsuranceAmount) ? `
                <!-- Contents Insurance Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">🛋️ ביטוח תכולה</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #fff3cd;">
                            <td style="padding: 10px; border: 1px solid #e0e0e0; width: 30%;"><strong>סכום ביטוח:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0; font-size: 18px; color: #0052cc;"><strong>${formatCurrency(data.contents.insuranceAmount || data.contents.contentsInsuranceAmount)}</strong></td>
                        </tr>
                        ${(data.contents.contentsBuildingAge || data.contents.buildingAge) ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;"><strong>גיל המבנה:</strong></td>
                            <td style="padding: 10px; border: 1px solid #e0e0e0;">${data.contents.contentsBuildingAge || data.contents.buildingAge} שנים</td>
                        </tr>
                        ` : ''}
                    </table>

                    <!-- Valuable Items - Only if they exist -->
                    ${(data.contents.jewelryAmount || data.contents.watchesAmount || data.contents.camerasAmount ||
                       data.contents.electronicsAmount || data.contents.bicyclesAmount || data.contents.musicalInstrumentsAmount) ? `
                    <h4 style="margin-top: 20px; color: #333;">פריטי ערך:</h4>
                    <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${data.contents.jewelryAmount ? `<li style="padding: 5px 0;">💍 תכשיטים: ${formatCurrency(data.contents.jewelryAmount)} ${data.contents.jewelryCoverage ? `(${data.contents.jewelryCoverage})` : ''}</li>` : ''}
                        ${data.contents.watchesAmount ? `<li style="padding: 5px 0;">⌚ שעונים: ${formatCurrency(data.contents.watchesAmount)} ${data.contents.watchesCoverage ? `(${data.contents.watchesCoverage})` : ''}</li>` : ''}
                        ${data.contents.camerasAmount ? `<li style="padding: 5px 0;">📷 מצלמות: ${formatCurrency(data.contents.camerasAmount)}</li>` : ''}
                        ${data.contents.electronicsAmount ? `<li style="padding: 5px 0;">📱 מכשירים אלקטרוניים: ${formatCurrency(data.contents.electronicsAmount)}</li>` : ''}
                        ${data.contents.bicyclesAmount ? `<li style="padding: 5px 0;">🚲 אופניים: ${formatCurrency(data.contents.bicyclesAmount)}</li>` : ''}
                        ${data.contents.musicalInstrumentsAmount ? `<li style="padding: 5px 0;">🎸 כלי נגינה: ${formatCurrency(data.contents.musicalInstrumentsAmount)}</li>` : ''}
                    </ul>
                    ` : ''}

                    <!-- Contents Coverages - Only if they exist -->
                    ${(typeof data.contents.contentsWaterDamage !== 'undefined' || 
                       typeof data.contents.contentsBurglary !== 'undefined' ||
                       data.contents.contentsEarthquake) ? `
                    <h4 style="margin-top: 20px; color: #333;">כיסויים:</h4>
                    <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${typeof data.contents.contentsWaterDamage !== 'undefined' ? `<li style="padding: 5px 0;">${data.contents.contentsWaterDamage ? '💧 נזקי מים' : '❌ ללא נזקי מים'}</li>` : ''}
                        ${typeof data.contents.contentsBurglary !== 'undefined' ? `<li style="padding: 5px 0;">${data.contents.contentsBurglary ? '🔒 פריצה גניבה ושוד' : '❌ ללא כיסוי פריצה'}</li>` : ''}
                        ${data.contents.contentsEarthquake ? `<li style="padding: 5px 0;">${data.contents.contentsEarthquake === 'כן' ? '🌍 רעידת אדמה' : '❌ ללא כיסוי רעידת אדמה'}</li>` : ''}
                        ${data.contents.contentsEarthquakeDeductible ? `<li style="padding: 5px 0;">💰 השתתפות עצמית רעידת אדמה: ${data.contents.contentsEarthquakeDeductible}</li>` : ''}
                    </ul>
                    ` : ''}
                </div>
                ` : ''}

                ${data.additionalCoverage && (data.additionalCoverage.businessContentsAmount || 
                   data.additionalCoverage.thirdPartyCoverage || data.additionalCoverage.employersLiability || 
                   data.additionalCoverage.cyberCoverage || data.additionalCoverage.terrorCoverage ||
                   data.additionalCoverage.businessEmployers || data.additionalCoverage.businessThirdParty) ? `
                <!-- Additional Coverages -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0052cc; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">🛡️ כיסויים נוספים</h3>
                    <ul style="background: #e8f5e9; padding: 15px 30px; border-radius: 5px; list-style: none;">
                        ${data.additionalCoverage.businessContentsAmount ? `<li style="padding: 5px 0;">💼 תכולה עסקית: ${formatCurrency(data.additionalCoverage.businessContentsAmount)}</li>` : ''}
                        ${data.additionalCoverage.businessEmployers ? '<li style="padding: 5px 0;">👨‍💼 חבות מעבידים עסקית</li>' : ''}
                        ${data.additionalCoverage.businessThirdParty ? '<li style="padding: 5px 0;">🤝 צד ג\' עסקי</li>' : ''}
                        ${data.additionalCoverage.thirdPartyCoverage ? '<li style="padding: 5px 0;">🛡️ צד שלישי</li>' : ''}
                        ${data.additionalCoverage.employersLiability ? '<li style="padding: 5px 0;">👥 חבות מעבידים</li>' : ''}
                        ${data.additionalCoverage.cyberCoverage ? '<li style="padding: 5px 0;">🔒 סייבר למשפחה</li>' : ''}
                        ${data.additionalCoverage.terrorCoverage ? '<li style="padding: 5px 0;">💥 טרור</li>' : ''}
                    </ul>
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
        const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        
        // Ensure PDF buffer is clean base64 without line breaks
        const pdfBase64 = pdfBuffer.toString('base64').replace(/\r?\n|\r/g, '');
        
        const messageParts = [
            `From: "אדמון סוכנות לביטוח" <royadmon23@gmail.com>`,
            `To: ${to}`,
            `Reply-To: royadmon23@gmail.com`,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: text/html; charset=utf-8',
            'Content-Transfer-Encoding: base64',
            '',
            Buffer.from(htmlContent).toString('base64').replace(/\r?\n|\r/g, ''),
            '',
            `--${boundary}`,
            'Content-Type: application/pdf',
            `Content-Disposition: attachment; filename="${filename}"`,
            'Content-Transfer-Encoding: base64',
            '',
            pdfBase64,
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
    let browser;
    try {
        console.log('📄 Starting PDF generation...');
        
        // Set chromium to headless mode
        chromium.setHeadlessMode = true;
        
        // Configure browser options for Vercel
        const browserOptions = {
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true
        };

        console.log('🚀 Launching browser with options:', JSON.stringify(browserOptions, null, 2));

        // Launch puppeteer browser
        browser = await puppeteer.launch(browserOptions);
        console.log('✅ Browser launched successfully');

        const page = await browser.newPage();
        console.log('📄 New page created');
        
        // Set viewport for better PDF rendering
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 1
        });
        
        // Set content with the beautiful HTML template
        await page.setContent(htmlContent, {
            waitUntil: ['domcontentloaded', 'networkidle0'],
            timeout: 30000
        });
        console.log('✅ HTML content set');

        // Wait for fonts and images to load
        await page.evaluateHandle('document.fonts.ready');
        await page.waitForTimeout(2000); // Give extra time for content to render

        // Generate PDF with optimized settings for Hebrew content and better compatibility
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '15mm',
                right: '15mm'
            },
            preferCSSPageSize: false,
            displayHeaderFooter: false,
            tagged: true,
            outline: false
        });

        console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`);
        
        // Enhanced PDF validation with detailed logging
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('PDF buffer is empty');
        }
        
        // Validate minimum PDF size (should be at least a few KB for a real PDF)
        if (pdfBuffer.length < 1000) {
            throw new Error(`PDF too small: ${pdfBuffer.length} bytes`);
        }
        
        // Validate that it starts with PDF header
        const pdfStart = pdfBuffer.slice(0, 8).toString();
        console.log('📄 PDF header check (first 8 bytes):', pdfStart);
        console.log('📄 PDF header as hex:', pdfBuffer.slice(0, 8).toString('hex'));
        
        // Check if it's a valid PDF by looking for PDF signature
        const pdfSignature = pdfBuffer.slice(0, 4).toString();
        if (!pdfSignature.includes('PDF')) {
            console.warn('⚠️ PDF signature not found in expected location');
            // Let's check a bit further
            const firstLine = pdfBuffer.slice(0, 20).toString();
            console.log('📄 First 20 characters:', firstLine);
        }
        
        console.log('✅ PDF validation passed');
        return pdfBuffer;
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        console.error('Error stack:', error.stack);
        throw error;
    } finally {
        // Always close browser
        if (browser) {
            try {
                await browser.close();
                console.log('🔒 Browser closed');
            } catch (closeError) {
                console.error('Error closing browser:', closeError);
            }
        }
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
        
        // Log received data
        console.log('📥 API received formData:', JSON.stringify(formData, null, 2));
        
        // Generate HTML content from form data
        const htmlContent = formatEmailContent(formData);
        
        // Generate PDF (validation is done inside generatePdf function)
        const pdfBuffer = await generatePdf(htmlContent);
        
        // Convert buffer to base64 with validation
        const base64Pdf = pdfBuffer.toString('base64');
        
        // Validate base64 encoding
        if (!base64Pdf || base64Pdf.length === 0) {
            throw new Error('Failed to convert PDF to base64');
        }
        
        console.log(`📄 PDF base64 size: ${base64Pdf.length} characters`);
        
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
                // Create a safe filename - only English characters, no Hebrew or special chars
                const firstName = (formData.firstName || 'customer').replace(/[^a-zA-Z0-9]/g, '');
                const lastName = (formData.lastName || '').replace(/[^a-zA-Z0-9]/g, '');
                const timestamp = Date.now();
                const filename = `insurance_lead_${firstName}${lastName ? '_' + lastName : ''}_${timestamp}.pdf`;
                emailResult = await sendEmailWithPdf(
                    emailTo,
                    emailSubject,
                    htmlContent,
                    pdfBuffer,
                    filename
                );
            }
        }
        
        // Return success response with safe filename
        const firstName = (formData.firstName || 'customer').replace(/[^a-zA-Z0-9]/g, '');
        const lastName = (formData.lastName || '').replace(/[^a-zA-Z0-9]/g, '');
        const timestamp = Date.now();
        
        res.status(200).json({
            success: true,
            filename: `insurance_lead_${firstName}${lastName ? '_' + lastName : ''}_${timestamp}.pdf`,
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