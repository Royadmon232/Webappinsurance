// Shared in-memory storage for verification codes (use database in production)
const verificationCodes = new Map();

// Helper function to get verification data
function getVerificationData(identifier) {
    return verificationCodes.get(identifier);
}

// Helper function to set verification data
function setVerificationData(identifier, data) {
    verificationCodes.set(identifier, data);
}

// Helper function to delete verification data
function deleteVerificationData(identifier) {
    verificationCodes.delete(identifier);
}

// Helper function to clean expired codes
function cleanExpiredCodes() {
    const now = Date.now();
    for (const [identifier, data] of verificationCodes.entries()) {
        if (data.expires < now) {
            verificationCodes.delete(identifier);
        }
    }
}

module.exports = {
    verificationCodes,
    getVerificationData,
    setVerificationData,
    deleteVerificationData,
    cleanExpiredCodes
}; 