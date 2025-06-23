const { google } = require('googleapis');

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

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, replyTo } = req.body;
    
    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide to, subject, and html fields' 
      });
    }
    
    // Create email message
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: "אדמון סוכנות לביטוח" <${process.env.GMAIL_USER || 'insurance@admon-agency.co.il'}>`,
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
    
    // For testing purposes, if Gmail API is not configured, just log and return success
    if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
      console.log('📧 Email would be sent to:', to);
      console.log('📧 Subject:', subject);
      console.log('📧 Email content logged (Gmail API not configured)');
      
      return res.status(200).json({
        success: true,
        messageId: `test_${Date.now()}`,
        message: 'Email logged successfully (test mode - Gmail API not configured)'
      });
    }
    
    // Send email via Gmail API
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
    
    console.log('Email sent successfully:', response.data.id);
    
    res.status(200).json({
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
} 