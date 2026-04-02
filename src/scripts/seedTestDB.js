require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('../models/user.model');

const seedTestDB = async () => {
  try {
    // Connect to test database
    await mongoose.connect(process.env.TEST_MONGO_URI);

    console.log('Connected to TEST database');

    // Clear existing test users
    await User.deleteMany({});
    console.log('Cleared existing test users');

    // Create admin user for testing
    const adminUser = new User({
      name: 'Test Admin',
      email: 'test-admin@zorvyn.com',
      password: 'TestAdmin@123', // This will be hashed by pre-save hook
      role: 'admin',
      isActive: true,
    });

    await adminUser.save();
    console.log('✅ Admin user created for testing');
    console.log('   Email: test-admin@zorvyn.com');
    console.log('   Password: TestAdmin@123');
    console.log('   Role: admin');

    // Create analyst user for testing
    const analystUser = new User({
      name: 'Test Analyst',
      email: 'test-analyst@zorvyn.com',
      password: 'TestAnalyst@123',
      role: 'analyst',
      isActive: true,
    });

    await analystUser.save();
    console.log('✅ Analyst user created for testing');
    console.log('   Email: test-analyst@zorvyn.com');
    console.log('   Password: TestAnalyst@123');
    console.log('   Role: analyst');

    // Create viewer user for testing
    const viewerUser = new User({
      name: 'Test Viewer',
      email: 'test-viewer@zorvyn.com',
      password: 'TestViewer@123',
      role: 'viewer',
      isActive: true,
    });

    await viewerUser.save();
    console.log('✅ Viewer user created for testing');
    console.log('   Email: test-viewer@zorvyn.com');
    console.log('   Password: TestViewer@123');
    console.log('   Role: viewer');

    console.log('\n✅ TEST DATABASE SEEDED SUCCESSFULLY\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test database:', error.message);
    process.exit(1);
  }
};

seedTestDB();
