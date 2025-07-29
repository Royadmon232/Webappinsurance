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
            `Reply-To: royadmon23@gmail.com`,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: text/html; charset=utf-8',
            'Content-Transfer-Encoding: base64',
            '',
            Buffer.from(htmlContent).toString('base64'),
            '',
            `--${boundary}`,
            `Content-Type: application/pdf; name="${filename}"`,
            `Content-Disposition: attachment; filename="${filename}"`,
            'Content-Transfer-Encoding: base64',
            '',
            pdfBuffer.toString('base64'),
            '',
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
        
        // Set viewport for consistent rendering
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 1
        });
        
        // Set content with the beautiful HTML template
        await page.setContent(htmlContent, {
            waitUntil: ['domcontentloaded', 'networkidle0']
        });
        console.log('✅ HTML content set');

        // Wait a bit for fonts to load
        await page.evaluateHandle('document.fonts.ready');

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
            preferCSSPageSize: false,
            displayHeaderFooter: false,
            tagged: false,
            outline: false
        });

        console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`);
        
        // Enhanced PDF validation
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('PDF buffer is empty');
        }
        
        // Validate minimum PDF size (should be at least a few KB for a real PDF)
        if (pdfBuffer.length < 500) {
            throw new Error(`PDF too small: ${pdfBuffer.length} bytes - likely corrupted`);
        }
        
        // Log first few bytes for debugging (without causing errors)
        const pdfStart = pdfBuffer.slice(0, 8);
        console.log('📄 PDF first 8 bytes:', Array.from(pdfStart));
        
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
        
        // Ensure base64 string is properly formatted (no line breaks, valid characters)
        const cleanBase64 = base64Pdf.replace(/[^A-Za-z0-9+/=]/g, '');
        if (cleanBase64.length !== base64Pdf.length) {
            console.warn('⚠️ Base64 had invalid characters, cleaned');
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