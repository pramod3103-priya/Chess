const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pramod_chess';

    try {
        mongoose.set('strictQuery', false);
        // Try connecting to provided/local MongoDB first with 2.5-second timeout
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 2500
        });
        if (mongoose.connection.db) {
            await mongoose.connection.db.admin().ping();
        }
        console.log(`✔ Connected to MongoDB at: ${mongoUri}`);
    } catch (err) {
        console.warn(`⚠ External/Local MongoDB unavailable (${err.message}).`);
        console.log(`🚀 Initializing standalone embedded MongoMemoryServer for seamless zero-setup execution...`);

        try {
            await mongoose.disconnect().catch(() => {});
            const { MongoMemoryServer } = require('mongodb-memory-server');
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log(`✔ Connected to embedded MongoMemoryServer at: ${uri}`);
        } catch (memErr) {
            console.error('❌ Failed to connect to any MongoDB instance:', memErr);
            process.exit(1);
        }
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        if (mongod) {
            await mongod.stop();
        }
    } catch (e) {
        console.error('Error during disconnectDB:', e);
    }
};

module.exports = { connectDB, disconnectDB };

