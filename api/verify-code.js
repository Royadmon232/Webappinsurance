// Import shared verification codes storage
const { 
    getVerificationData, 
    deleteVerificationData, 
    cleanExpiredCodes 
} = require('./verification-storage');

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
        const { phoneNumber, email, code } = req.body;

        console.log('=== VERIFICATION REQUEST RECEIVED ===');
        console.log('Request body:', req.body);
        console.log('phoneNumber:', phoneNumber);
        console.log('email:', email);
        console.log('code:', code);

        // Determine the identifier (email or phone)
        const identifier = email || phoneNumber;

        console.log('Determined identifier:', identifier);

        if (!identifier) {
            console.log('ERROR: No identifier provided');
            return res.status(400).json({ error: 'Either email or phone number is required' });
        }

        if (!code) {
            console.log('ERROR: No code provided');
            return res.status(400).json({ error: 'Verification code is required' });
        }

        // Clean expired codes
        cleanExpiredCodes();

        // Debug: Show all stored verification codes
        const { verificationCodes } = require('./verification-storage');
        console.log('=== ALL STORED VERIFICATION CODES ===');
        for (const [storedIdentifier, storedData] of verificationCodes.entries()) {
            console.log(`Stored: "${storedIdentifier}" -> Code: "${storedData.code}", Expires: ${new Date(storedData.expires).toISOString()}`);
        }
        console.log('Looking for identifier:', `"${identifier}"`);

        // Get verification data
        const verificationData = getVerificationData(identifier);

        if (!verificationData) {
            console.log(`Verification attempt failed: No code found for ${identifier}`);
            
            // Debug info for client
            const debugInfo = {
                totalStoredCodes: verificationCodes.size,
                searchedIdentifier: identifier,
                identifierType: typeof identifier,
                identifierLength: identifier ? identifier.length : 0,
                currentTime: new Date().toISOString(),
                allStoredIdentifiers: Array.from(verificationCodes.keys())
            };
            
            return res.status(400).json({ 
                success: false,
                error: 'Invalid verification code or expired',
                debug: debugInfo // Always include debug info for now
            });
        }
        
        console.log(`Found verification data for ${identifier}:`, {
            code: verificationData.code,
            codeType: typeof verificationData.code,
            expires: new Date(verificationData.expires).toISOString(),
            attempts: verificationData.attempts
        });

        // Check if code has expired
        if (verificationData.expires < Date.now()) {
            deleteVerificationData(identifier);
            console.log(`Verification attempt failed: Code expired for ${identifier}`);
            return res.status(400).json({ 
                success: false,
                error: 'Verification code has expired' 
            });
        }

        // Check for too many attempts
        if (verificationData.attempts >= 5) {
            deleteVerificationData(identifier);
            console.log(`Verification attempt failed: Too many attempts for ${identifier}`);
            return res.status(429).json({ 
                success: false,
                error: 'Too many verification attempts. Please request a new code.' 
            });
        }

        // Increment attempts
        verificationData.attempts++;

        // Verify the code - ensure both are strings for comparison
        const storedCode = String(verificationData.code);
        const receivedCode = String(code);
        
        console.log(`Verification attempt for ${identifier}:`);
        console.log(`  Stored code: "${storedCode}" (type: ${typeof verificationData.code})`);
        console.log(`  Received code: "${receivedCode}" (type: ${typeof code})`);
        console.log(`  Codes match: ${storedCode === receivedCode}`);
        
        if (storedCode !== receivedCode) {
            console.log(`Verification attempt failed: Wrong code for ${identifier}. Attempt ${verificationData.attempts}/5`);
            return res.status(400).json({ 
                success: false,
                error: 'Invalid verification code',
                attemptsRemaining: 5 - verificationData.attempts
            });
        }

        // Success! Remove the verification data
        deleteVerificationData(identifier);

        // Generate a simple token (in production, use proper JWT with secret)
        const token = Buffer.from(`${identifier}:${Date.now()}`).toString('base64');

        console.log(`Verification successful for ${identifier}`);

        res.status(200).json({
            success: true,
            message: 'Verification successful',
            token: token
        });

    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 