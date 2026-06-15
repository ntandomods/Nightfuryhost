const mongoose = require('mongoose');

const connectDB = async () => {
  // Check if MongoDB URI is provided
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoUri) {
    console.log('⚠️  No MongoDB URI provided');
    console.log('✅ Running in DEMO MODE with in-memory database');
    console.log('📝 Note: Data will be lost on server restart');
    console.log('🔗 To use persistent storage, set MONGODB_URI environment variable');
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️  MongoDB Connection Error: ${error.message}`);
    console.log('✅ Switching to DEMO MODE with in-memory database');
    console.log('📝 Note: Data will be lost on server restart');
    return null;
  }
};

module.exports = connectDB;
