// vercel-oauth-config.js
// This file is used to inject environment variables into the HTML demo for Vercel deployment

const fs = require('fs');
const path = require('path');

// Read the HTML template
const htmlPath = path.join(__dirname, 'oauth-demo-vercel.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace environment variable placeholders with actual values
const envReplacements = {
    '{{GMAIL_CLIENT_ID}}': process.env.GMAIL_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
    '{{GMAIL_ACCESS_TOKEN}}': process.env.GMAIL_ACCESS_TOKEN || '',
    '{{GMAIL_REFRESH_TOKEN}}': process.env.GMAIL_REFRESH_TOKEN || ''
};

// Perform replacements
Object.keys(envReplacements).forEach(placeholder => {
    htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), envReplacements[placeholder]);
});

// Write the processed HTML to a public directory or serve it directly
const outputPath = path.join(__dirname, 'public', 'oauth-demo-vercel.html');
const outputDir = path.dirname(outputPath);

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, htmlContent);

console.log('✅ OAuth demo HTML generated with environment variables');
console.log('📍 Output:', outputPath);

module.exports = { htmlContent }; 