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

        // Determine the identifier (email or phone)
        const identifier = email || phoneNumber;

        if (!identifier) {
            return res.status(400).json({ error: 'Either email or phone number is required' });
        }

        if (!code) {
            return res.status(400).json({ error: 'Verification code is required' });
        }

        // Clean expired codes
        cleanExpiredCodes();

        // Get verification data
        const verificationData = getVerificationData(identifier);

        if (!verificationData) {
            console.log(`Verification attempt failed: No code found for ${identifier}`);
            return res.status(400).json({ 
                success: false,
                error: 'Invalid verification code or expired' 
            });
        }

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

        // Verify the code
        if (verificationData.code !== code) {
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