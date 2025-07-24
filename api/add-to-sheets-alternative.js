import fetch from 'node-fetch';

// Alternative Google Sheets implementation using direct API calls
// This avoids the googleapis library that might have OpenSSL issues

const GOOGLE_SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Simple JWT token creation for Google API
function createJWT(serviceAccountEmail, privateKey, scopes) {
    const crypto = require('crypto');
    
    // JWT Header
    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };
    
    // JWT Payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: serviceAccountEmail,
        scope: scopes.join(' '),
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    };
    
    // Base64 encode
    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    // Create signature
    const signatureInput = `${base64Header}.${base64Payload}`;
    const signature = crypto.sign('RSA-SHA256', Buffer.from(signatureInput), privateKey);
    const base64Signature = signature.toString('base64url');
    
    return `${base64Header}.${base64Payload}.${base64Signature}`;
}

// Get access token from Google
async function getAccessToken(serviceAccountEmail, privateKey) {
    try {
        const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
        const jwt = createJWT(serviceAccountEmail, privateKey, scopes);
        
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt
            })
        });
        
        if (!response.ok) {
            throw new Error(`Token request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Access token error:', error);
        throw error;
    }
}

// Add row to Google Sheets using direct API
async function addRowToSheets(accessToken, spreadsheetId, range, values) {
    const url = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${range}:append`;
    
    const response = await fetch(`${url}?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            values: [values]
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sheets API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
}

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
        const { formData } = req.body;
        
        if (!formData) {
            return res.status(400).json({ 
                error: 'Missing form data',
                message: 'Please provide form data to add to sheets' 
            });
        }

        // Check environment variables
        const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKeyEnv = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
        const range = process.env.GOOGLE_SHEETS_RANGE || 'לידים!A:BH';

        if (!serviceAccountEmail || !privateKeyEnv || !spreadsheetId) {
            return res.status(500).json({
                success: false,
                error: 'Missing environment variables',
                details: {
                    hasEmail: !!serviceAccountEmail,
                    hasPrivateKey: !!privateKeyEnv,
                    hasSpreadsheetId: !!spreadsheetId
                }
            });
        }

        // Parse private key
        let privateKey = privateKeyEnv;
        
        // Handle base64 encoded key
        if (!privateKey.includes('BEGIN PRIVATE KEY')) {
            try {
                privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
            } catch (e) {
                return res.status(500).json({
                    success: false,
                    error: 'Invalid private key format',
                    message: 'Private key must be in PEM format or base64 encoded'
                });
            }
        }
        
        // Clean up newlines
        privateKey = privateKey.replace(/\\n/g, '\n');

        console.log('Alternative Sheets API: Getting access token...');
        
        // Get access token
        const accessToken = await getAccessToken(serviceAccountEmail, privateKey);
        
        console.log('Alternative Sheets API: Access token obtained');

        // Format helpers
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            try {
                return new Date(dateStr).toLocaleDateString('he-IL');
            } catch {
                return dateStr;
            }
        };

        const formatCurrency = (amount) => {
            if (!amount || amount === '0') return '';
            return new Intl.NumberFormat('he-IL').format(amount);
        };

        const formatBoolean = (value) => value ? 'כן' : 'לא';

        // Prepare row data (same as original)
        const rowData = [
            // תאריך ושעה
            new Date().toLocaleDateString('he-IL'),
            new Date().toLocaleTimeString('he-IL'),
            
            // פרטים אישיים
            formData.firstName || '',
            formData.lastName || '',
            formData.idNumber || '',
            formData.phoneNumber || '',
            formData.email || '',
            formatDate(formData.startDate),
            
            // סוג מוצר
            formData.productType || '',
            
            // פרטי נכס
            formData.propertyType || '',
            formData.city || '',
            formData.street || '',
            formData.houseNumber || '',
            formData.postalCode || formData.zipCode || '',
            formData.floorCount || '',
            formatBoolean(formData.hasGarden),
            
            // בנק (אם משועבד)
            formData.selectedBank || '',
            formData.selectedBranch || '',
            
            // ביטוח מבנה
            formData.building?.buildingInsuranceAmount ? formatCurrency(formData.building.buildingInsuranceAmount) : '',
            formData.building?.buildingAge || '',
            formData.building?.buildingArea || '',
            formData.building?.constructionType || '',
            formData.building?.constructionStandard || '',
            formatBoolean(formData.building?.mortgagedProperty),
            formatDate(formData.building?.loanEndDate),
            
            // תוספות מבנה
            formData.building?.hasTerrace || '',
            formData.building?.terraceArea || '',
            formData.building?.hasGarden || '',
            formData.building?.gardenArea || '',
            formData.building?.roofType || '',
            formatBoolean(formData.building?.hasSwimmingPool),
            formData.building?.swimmingPoolValue ? formatCurrency(formData.building.swimmingPoolValue) : '',
            
            // כיסויים למבנה
            formData.building?.waterDamageType || '',
            formData.building?.waterDeductible || '',
            formatBoolean(formData.building?.burglaryBuilding),
            formData.building?.earthquakeCoverage || '',
            formData.building?.earthquakeLandCoverage || '',
            formData.building?.earthquakeCoverageAmount ? formatCurrency(formData.building.earthquakeCoverageAmount) : '',
            
            // ביטוח תכולה
            formData.contents?.contentsValue ? formatCurrency(formData.contents.contentsValue) : '',
            formData.contents?.contentsBuildingAge || '',
            formData.contents?.hasJewelry || '',
            formData.contents?.jewelryAmount ? formatCurrency(formData.contents.jewelryAmount) : '',
            formData.contents?.hasWatches || '',
            formData.contents?.watchesAmount ? formatCurrency(formData.contents.watchesAmount) : '',
            formData.contents?.contentsEarthquakeCoverage || '',
            
            // כיסויים נוספים
            formatBoolean(formData.additionalCoverage?.thirdPartyCoverage),
            formatBoolean(formData.additionalCoverage?.employersLiability),
            formatBoolean(formData.additionalCoverage?.cyberCoverage),
            formatBoolean(formData.additionalCoverage?.terrorCoverage),
            
            // הרחבות נוספות
            formData.building?.additionalSharedInsurance || '',
            formData.building?.buildingContentsInsurance || '',
            formData.building?.storageInsurance || '',
            formData.building?.swimmingPoolInsurance || '',
            formData.building?.mortgageWaterDamage || ''
        ];

        console.log('Alternative Sheets API: Adding row to sheets...');

        // Add row to sheets
        const result = await addRowToSheets(accessToken, spreadsheetId, range, rowData);

        console.log('Alternative Sheets API: Successfully added row');

        res.status(200).json({
            success: true,
            message: 'Data added to Google Sheets successfully (alternative method)',
            updatedRange: result.updates?.updatedRange,
            updatedRows: result.updates?.updatedRows,
            method: 'alternative-api'
        });

    } catch (error) {
        console.error('Alternative Sheets API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add data to Google Sheets (alternative method)',
            message: error.message,
            method: 'alternative-api'
        });
    }
} 