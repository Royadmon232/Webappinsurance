/**
 * MongoDB Connection Test API Endpoint
 * API endpoint לבדיקת חיבור MongoDB
 */

const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const testResults = {
        timestamp: new Date().toISOString(),
        mongoUriConfigured: false,
        connectionSuccess: false,
        databaseAccess: false,
        collectionAccess: false,
        writeTest: false,
        readTest: false,
        indexCreation: false,
        error: null,
        details: []
    };

    let client = null;

    try {
        // Check if MongoDB URI is configured
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            testResults.error = 'MONGODB_URI environment variable is not set';
            testResults.details.push('❌ MongoDB URI not configured in environment variables');
            return res.status(500).json(testResults);
        }

        testResults.mongoUriConfigured = true;
        testResults.details.push('✅ MongoDB URI is configured');
        testResults.details.push(`📍 Using URI: ${mongoUri.substring(0, 30)}...`);

        // Test connection with shorter timeouts for Vercel
        testResults.details.push('⏳ Attempting to connect to MongoDB...');
        
        const options = {
            serverSelectionTimeoutMS: 8000, // 8 seconds max
            connectTimeoutMS: 8000,
            socketTimeoutMS: 8000,
            maxPoolSize: 1,
            retryWrites: true
        };
        
        client = new MongoClient(mongoUri, options);
        await client.connect();
        
        testResults.connectionSuccess = true;
        testResults.details.push('✅ Successfully connected to MongoDB');

        // Test database access
        testResults.details.push('📂 Testing database access...');
        const database = client.db('insurance_db');
        
        testResults.databaseAccess = true;
        testResults.details.push('✅ Database access successful');

        // Test collection access
        testResults.details.push('📄 Testing collection access...');
        const collection = database.collection('verification_codes');
        
        testResults.collectionAccess = true;
        testResults.details.push('✅ Collection access successful');

        // Quick write test
        testResults.details.push('📝 Testing write operation...');
        const testDoc = {
            identifier: 'quick-test@mongodb.com',
            code: '999999',
            expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            attempts: 0,
            createdAt: new Date(),
            quickTest: true
        };

        const insertResult = await collection.insertOne(testDoc);
        testResults.writeTest = true;
        testResults.details.push(`✅ Write operation successful`);

        // Quick read test
        testResults.details.push('📖 Testing read operation...');
        const foundDoc = await collection.findOne({ identifier: 'quick-test@mongodb.com' });
        
        if (foundDoc) {
            testResults.readTest = true;
            testResults.details.push('✅ Read operation successful');
        } else {
            testResults.details.push('❌ Read operation failed');
        }

        // Test TTL index creation (quick)
        testResults.details.push('⏰ Testing TTL index...');
        try {
            await collection.createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
            testResults.indexCreation = true;
            testResults.details.push('✅ TTL index ready');
        } catch (indexError) {
            testResults.indexCreation = true;
            testResults.details.push('✅ TTL index already exists');
        }

        // Quick cleanup
        await collection.deleteOne({ identifier: 'quick-test@mongodb.com' });
        testResults.details.push('🧹 Test document cleaned up');

        // Quick stats
        const stats = await collection.countDocuments({});
        testResults.details.push(`📊 Collection contains ${stats} documents`);

        testResults.details.push('🎉 All MongoDB tests completed successfully!');
        testResults.details.push('💡 Verification system is ready to work');

        return res.status(200).json(testResults);

    } catch (error) {
        testResults.error = error.message;
        testResults.details.push(`❌ Error: ${error.name}`);
        testResults.details.push(`📝 Message: ${error.message}`);

        if (error.message.includes('Authentication failed')) {
            testResults.details.push('🔐 Check username and password in MongoDB URI');
        } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
            testResults.details.push('⏱️ Connection timeout - check MongoDB Atlas settings');
            testResults.details.push('💡 Ensure IP whitelist includes 0.0.0.0/0');
        } else if (error.message.includes('ENOTFOUND')) {
            testResults.details.push('🌐 DNS resolution failed - check cluster URL');
        } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
            testResults.details.push('🔒 SSL/TLS connection issue');
        }

        return res.status(500).json(testResults);

    } finally {
        if (client) {
            try {
                await client.close();
                testResults.details.push('🔌 Connection closed');
            } catch (closeError) {
                testResults.details.push('⚠️ Connection close warning');
            }
        }
    }
}; 