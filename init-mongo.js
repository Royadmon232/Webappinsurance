// MongoDB initialization script
db = db.getSiblingDB('insurance_db');

// Create user for the application
db.createUser({
  user: 'insurance_app',
  pwd: 'insurance_password',
  roles: [
    {
      role: 'readWrite',
      db: 'insurance_db'
    }
  ]
});

// Create collections
db.createCollection('verificationcodes');
db.createCollection('insuranceforms');

// Create indexes
db.verificationcodes.createIndex({ phoneNumber: 1 });
db.verificationcodes.createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 });

db.insuranceforms.createIndex({ phoneNumber: 1 });
db.insuranceforms.createIndex({ email: 1 });
db.insuranceforms.createIndex({ submittedAt: -1 });
db.insuranceforms.createIndex({ status: 1 });

print('MongoDB initialization completed!'); 