require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Customer = require('../src/models/Customer');

const seedCustomers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // 1. Ensure Admin exists (as the creator)
    const adminEmail = process.env.ADMIN_SEED_EMAIL;
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('Admin user not found! Please run seedAdmin.js first.');
      process.exit(1);
    }

    // 2. Create a test Sales Executive (if doesn't exist)
    const seEmail = 'sales@crm.com';
    let seUser = await User.findOne({ email: seEmail });

    if (!seUser) {
      seUser = await User.create({
        name: 'John Sales',
        email: seEmail,
        password: 'salespassword123',
        role: 'salesExecutive',
        phone: '1234567890'
      });
      console.log(`Created test Sales Executive: ${seEmail}`);
    } else {
      console.log(`Sales Executive ${seEmail} already exists.`);
    }

    // 3. Clear existing customers assigned to this SE (optional for clean state)
    await Customer.deleteMany({ assignedTo: seUser._id });
    console.log('Cleared existing customers for test SE...');

    // 4. Create sample customers assigned to SE
    const customersToCreate = [
      {
        name: 'Acme Corp Contact',
        email: 'contact@acme.com',
        phone: '15550101000',
        address: '123 Acme Way',
        assignedTo: seUser._id,
        createdBy: admin._id
      },
      {
        name: 'Globex Inc Contact',
        email: 'hello@globex.com',
        phone: '15550202000',
        address: '456 Globex Blvd',
        assignedTo: seUser._id,
        createdBy: admin._id
      },
      {
        name: 'Initech Representative',
        email: 'rep@initech.com',
        phone: '15550303000',
        address: '789 Initech Pkwy',
        assignedTo: seUser._id,
        createdBy: admin._id
      }
    ];

    await Customer.insertMany(customersToCreate);
    console.log('Successfully seeded 3 customers assigned to Sales Executive.');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedCustomers();
