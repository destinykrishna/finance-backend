require('dotenv').config();
const mongoose = require('mongoose');

// Disable rate limiting in test environment
process.env.NODE_ENV = 'test';

// Connect to test database before running tests
beforeAll(async () => {
  try {
    // Disconnect from any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Connect to test database
    await mongoose.connect(process.env.TEST_MONGO_URI);

    console.log('\n✅ Connected to TEST database\n');

    // Global test credentials
    global.testUsers = {
      admin: {
        email: 'test-admin@zorvyn.com',
        password: 'TestAdmin@123',
        role: 'admin',
      },
      analyst: {
        email: 'test-analyst@zorvyn.com',
        password: 'TestAnalyst@123',
        role: 'analyst',
      },
      viewer: {
        email: 'test-viewer@zorvyn.com',
        password: 'TestViewer@123',
        role: 'viewer',
      },
    };

    console.log('✅ Test credentials loaded globally\n');
  } catch (error) {
    console.error('Failed to connect to test database:', error.message);
    process.exit(1);
  }
});

// Disconnect after all tests
afterAll(async () => {
  try {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from TEST database\n');
  } catch (error) {
    console.error('Error disconnecting from test database:', error.message);
  }
});

