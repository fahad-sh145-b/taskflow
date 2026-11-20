const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongodbURL = process.env.MONGODB_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow';

if (!process.env.MONGODB_URL && !process.env.MONGO_URI) {
    console.warn('⚠️ [DB WARNING] MONGODB_URL / MONGO_URI is not set in backend/.env. Attempting default: mongodb://127.0.0.1:27017/taskflow');
}

mongoose.connect(mongodbURL).catch(err => {
    console.log('❌ Initial MongoDB connection error:', err.message);
    console.log('👉 Tip: Add your MongoDB Atlas connection string to backend/.env: MONGODB_URL=mongodb+srv://...');
});

const db = mongoose.connection;

db.on('connected', () => {
    console.log('Connected to MongoDB database');
});

db.on('error', (err) => {
    console.log('MongoDB Connection Error:', err.message);
});

module.exports = db;
