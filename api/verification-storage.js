const fs = require('fs');
const path = require('path');

// File-based storage for serverless environments
const STORAGE_FILE = path.join('/tmp', 'verification-codes.json');

// Helper function to read storage from file
function readStorage() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const data = fs.readFileSync(STORAGE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading verification storage:', error);
    }
    return {};
}

// Helper function to write storage to file
function writeStorage(data) {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
        console.log('Verification codes saved to file');
    } catch (error) {
        console.error('Error writing verification storage:', error);
    }
}

// Helper function to get verification data
function getVerificationData(identifier) {
    const storage = readStorage();
    return storage[identifier];
}

// Helper function to set verification data
function setVerificationData(identifier, data) {
    const storage = readStorage();
    storage[identifier] = data;
    writeStorage(storage);
    console.log(`Verification code stored for ${identifier}:`, data);
}

// Helper function to delete verification data
function deleteVerificationData(identifier) {
    const storage = readStorage();
    delete storage[identifier];
    writeStorage(storage);
    console.log(`Verification code deleted for ${identifier}`);
}

// Helper function to clean expired codes
function cleanExpiredCodes() {
    const storage = readStorage();
    const now = Date.now();
    let hasChanges = false;
    
    for (const [identifier, data] of Object.entries(storage)) {
        if (data.expires < now) {
            delete storage[identifier];
            hasChanges = true;
            console.log(`Expired verification code removed for ${identifier}`);
        }
    }
    
    if (hasChanges) {
        writeStorage(storage);
    }
}

// Legacy support - create a Map-like object for compatibility
const verificationCodes = {
    size: 0,
    entries: function* () {
        const storage = readStorage();
        for (const [key, value] of Object.entries(storage)) {
            yield [key, value];
        }
    },
    keys: function* () {
        const storage = readStorage();
        for (const key of Object.keys(storage)) {
            yield key;
        }
    }
};

// Update size property
Object.defineProperty(verificationCodes, 'size', {
    get: function() {
        const storage = readStorage();
        return Object.keys(storage).length;
    }
});

module.exports = {
    verificationCodes,
    getVerificationData,
    setVerificationData,
    deleteVerificationData,
    cleanExpiredCodes
}; 