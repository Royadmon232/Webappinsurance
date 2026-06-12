/**
 * General lead intake endpoint.
 * Validates the inquiry, then emails it to the agency mailbox via the Gmail API
 * (same OAuth2 credentials the previous flow used: GMAIL_CLIENT_ID,
 * GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN). Recipient is configurable via
 * LEAD_TO_EMAIL. No PII is written to logs.
 */
const { google } = require('googleapis');

const ALLOWED_ORIGINS = [
    'https://admon-insurance-agency.co.il',
    'https://www.admon-insurance-agency.co.il',
    'http://localhost:8080',
    'http://localhost:3000'
];

const ALLOWED_INTERESTS = [
    'ביטוח דירה',
    'ביטוח רכב',
    'ביטוח בריאות',
    'ביטוח חיים',
    'ביטוח חיים למשכנתא',
    'פנסיה',
    'קרן השתלמות',
    'קופת גמל / גמל להשקעה',
    'ביטוח מנהלים',
    'תיקון 190',
    'תכנון פיננסי',
    'פתרונות למעסיקים וארגונים',
    'אחר'
];

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function isValidIsraeliPhone(value) {
    const digits = String(value || '').replace(/[^\d]/g, '');
    return /^0(5\d{8}|[23489]\d{7}|7\d{8})$/.test(digits);
}

module.exports = async (req, res) => {
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body || {};
        const name = String(body.name || '').trim().slice(0, 80);
        const phone = String(body.phone || '').trim().slice(0, 20);
        const interest = String(body.interest || '').trim();
        const note = String(body.note || '').trim().slice(0, 1000);
        const page = String(body.page || '').trim().slice(0, 200);

        // Honeypot: bots fill the hidden "company" field. Pretend success.
        if (body.company) {
            return res.status(200).json({ success: true });
        }

        if (name.length < 2) {
            return res.status(400).json({ error: 'INVALID_NAME' });
        }
        if (!isValidIsraeliPhone(phone)) {
            return res.status(400).json({ error: 'INVALID_PHONE' });
        }
        if (!ALLOWED_INTERESTS.includes(interest)) {
            return res.status(400).json({ error: 'INVALID_INTEREST' });
        }

        if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
            // Email transport not configured — surface a real error so the
            // client can offer the WhatsApp fallback instead of dropping leads.
            console.error('Lead endpoint: Gmail API credentials are not configured');
            return res.status(503).json({ error: 'EMAIL_NOT_CONFIGURED' });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            process.env.GMAIL_REDIRECT_URI
        );
        oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const to = process.env.LEAD_TO_EMAIL || 'yizhaq@admon-ins.co.il';
        const subject = `ליד חדש מהאתר: ${interest} — ${name}`;
        const submittedAt = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });

        const html = `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
                <div style="background: #0c2240; color: #fff; padding: 18px 24px; border-radius: 10px 10px 0 0;">
                    <h2 style="margin: 0; font-size: 18px;">פנייה חדשה מאתר הסוכנות</h2>
                </div>
                <table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #dfe6ef;">
                    <tr><td style="padding: 10px 16px; font-weight: bold; width: 130px;">תחום עניין</td><td style="padding: 10px 16px;">${escapeHtml(interest)}</td></tr>
                    <tr style="background: #f6f8fb;"><td style="padding: 10px 16px; font-weight: bold;">שם מלא</td><td style="padding: 10px 16px;">${escapeHtml(name)}</td></tr>
                    <tr><td style="padding: 10px 16px; font-weight: bold;">טלפון</td><td style="padding: 10px 16px;" dir="ltr">${escapeHtml(phone)}</td></tr>
                    <tr style="background: #f6f8fb;"><td style="padding: 10px 16px; font-weight: bold;">הערה</td><td style="padding: 10px 16px;">${note ? escapeHtml(note) : '—'}</td></tr>
                    <tr><td style="padding: 10px 16px; font-weight: bold;">עמוד מקור</td><td style="padding: 10px 16px;" dir="ltr">${escapeHtml(page || '/')}</td></tr>
                    <tr style="background: #f6f8fb;"><td style="padding: 10px 16px; font-weight: bold;">מועד</td><td style="padding: 10px 16px;">${escapeHtml(submittedAt)}</td></tr>
                </table>
            </div>`;

        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const message = [
            `To: ${to}`,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            html
        ].join('\n');

        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedMessage }
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Lead endpoint error:', error && error.message ? error.message : 'unknown');
        return res.status(500).json({ error: 'LEAD_SEND_FAILED' });
    }
};
