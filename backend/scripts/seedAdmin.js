require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_SEED_EMAIL;
    const adminPassword = process.env.ADMIN_SEED_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('Missing ADMIN_SEED_EMAIL or ADMIN_SEED_PASSWORD in environment variables');
      process.exit(1);
    }

    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create Admin user
    const admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log(`Admin user created successfully with email: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
