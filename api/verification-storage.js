const { MongoClient } = require('mongodb');

let client = null;
let database = null;
let collection = null;

// MongoDB connection setup
async function connectToMongoDB() {
    if (!client) {
        try {
            const mongoUri = process.env.MONGODB_URI;
            if (!mongoUri) {
                throw new Error('MONGODB_URI environment variable is not set');
            }
            
            // Shorter timeouts for Vercel serverless functions
            const options = {
                serverSelectionTimeoutMS: 5000, // 5 seconds instead of 30
                connectTimeoutMS: 5000,
                socketTimeoutMS: 5000,
                maxPoolSize: 1, // Single connection for serverless
                retryWrites: true,
                retryReads: true
            };
            
            client = new MongoClient(mongoUri, options);
            await client.connect();
            database = client.db('insurance_db');
            collection = database.collection('verification_codes');
            
            // Create TTL index for automatic expiration (ignore errors if exists)
            try {
                await collection.createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
            } catch (indexError) {
                console.log('TTL index might already exist:', indexError.message);
            }
            
            console.log('Connected to MongoDB successfully');
        } catch (error) {
            console.error('Failed to connect to MongoDB:', error.message);
            client = null; // Reset client on failure
            throw error;
        }
    }
    return collection;
}

// Helper function to get verification data
async function getVerificationData(identifier) {
    try {
        const coll = await connectToMongoDB();
        const result = await coll.findOne({ 
            identifier: identifier,
            expires: { $gt: new Date() } // Only return non-expired codes
        });
        
        if (result) {
            return {
                code: result.code,
                expires: result.expires.getTime(),
                attempts: result.attempts || 0
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting verification data:', error.message);
        return null;
    }
}

// Helper function to set verification data
async function setVerificationData(identifier, data) {
    try {
        const coll = await connectToMongoDB();
        const document = {
            identifier: identifier,
            code: String(data.code),
            expires: new Date(data.expires),
            attempts: data.attempts || 0,
            createdAt: new Date()
        };
        
        // Upsert with timeout
        const result = await coll.replaceOne(
            { identifier: identifier },
            document,
            { upsert: true }
        );
        
        console.log(`Verification code stored in MongoDB for ${identifier}:`, {
            code: document.code,
            expires: document.expires.toISOString(),
            attempts: document.attempts,
            upserted: result.upsertedCount > 0
        });
    } catch (error) {
        console.error('Error setting verification data:', error.message);
        throw error;
    }
}

// Helper function to delete verification data
async function deleteVerificationData(identifier) {
    try {
        const coll = await connectToMongoDB();
        const result = await coll.deleteOne({ identifier: identifier });
        console.log(`Verification code deleted from MongoDB for ${identifier}, deleted: ${result.deletedCount}`);
    } catch (error) {
        console.error('Error deleting verification data:', error.message);
        throw error;
    }
}

// Helper function to clean expired codes (mostly handled by TTL index)
async function cleanExpiredCodes() {
    try {
        const coll = await connectToMongoDB();
        const result = await coll.deleteMany({ 
            expires: { $lt: new Date() } 
        });
        
        if (result.deletedCount > 0) {
            console.log(`Cleaned ${result.deletedCount} expired verification codes from MongoDB`);
        }
    } catch (error) {
        console.error('Error cleaning expired codes:', error.message);
        // Don't throw - this is cleanup
    }
}

// Helper function to get all stored codes for debugging
async function getAllStoredCodes() {
    try {
        const coll = await connectToMongoDB();
        const codes = await coll.find({}).limit(10).toArray(); // Limit for performance
        return codes.map(code => ({
            identifier: code.identifier,
            code: code.code,
            expires: code.expires,
            attempts: code.attempts
        }));
    } catch (error) {
        console.error('Error getting all stored codes:', error.message);
        return [];
    }
}

// Helper function to get storage statistics for debugging
async function getStorageStats() {
    try {
        const coll = await connectToMongoDB();
        const totalCodes = await coll.countDocuments({});
        const activeCodes = await coll.countDocuments({ 
            expires: { $gt: new Date() } 
        });
        const identifiers = await coll.distinct('identifier');
        
        return {
            totalStoredCodes: totalCodes,
            activeStoredCodes: activeCodes,
            allStoredIdentifiers: identifiers.slice(0, 10), // Limit for performance
            currentTime: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error getting storage stats:', error.message);
        return {
            totalStoredCodes: 0,
            activeStoredCodes: 0,
            allStoredIdentifiers: [],
            currentTime: new Date().toISOString(),
            error: error.message
        };
    }
}

// Close connection (useful for cleanup)
async function closeConnection() {
    if (client) {
        try {
            await client.close();
            client = null;
            database = null;
            collection = null;
            console.log('MongoDB connection closed');
        } catch (error) {
            console.error('Error closing MongoDB connection:', error.message);
        }
    }
}

module.exports = {
    getVerificationData,
    setVerificationData,
    deleteVerificationData,
    cleanExpiredCodes,
    getAllStoredCodes,
    getStorageStats,
    closeConnection
}; 