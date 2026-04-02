# Zorvyn API - Jest & Supertest Testing Guide

## 🎯 Setup Overview

The testing infrastructure now uses a **separate test database** with **pre-created users** to ensure consistent, reliable tests.

### Database Configuration

```
Production:  mongodb://localhost:27017/finance_db
Test:        mongodb://localhost:27017/finance_db_test
```

Both databases run on the same MongoDB instance but are completely isolated.

---

## 🔐 Pre-Created Test Users

Three users are automatically created in the test database:

### 1. Admin User
```
Email:    test-admin@zorvyn.com
Password: TestAdmin@123
Role:     admin
```

### 2. Analyst User
```
Email:    test-analyst@zorvyn.com
Password: TestAnalyst@123
Role:     analyst
```

### 3. Viewer User
```
Email:    test-viewer@zorvyn.com
Password: TestViewer@123
Role:     viewer
```

---

## 🚀 How to Run Tests

### Seed Test Database (Creates Pre-Created Users)
```bash
npm run seed:test
```

Output:
```
✅ Admin user created for testing
✅ Analyst user created for testing  
✅ Viewer user created for testing
✅ TEST DATABASE SEEDED SUCCESSFULLY
```

### Run All Tests (Auto-Seeds First)
```bash
npm test
```

This command automatically runs `npm run seed:test` before executing tests, ensuring a clean test database with fresh test users.

### Run Specific Test Suite
```bash
npm test -- rbac-precreated.test.js
npm test -- auth.test.js
npm test -- transaction.test.js
```

### Watch Mode (Re-runs on File Changes)
```bash
npm run test:watch
```

---

## 📋 Test Suites Available

### ✅ RBAC Tests (rbac-precreated.test.js) - **21/21 PASSING**
Tests role-based access control using pre-created users from database.

**Admin Role Tests:**
- ✅ Can create transactions
- ✅ Can view all transactions
- ✅ Can access dashboard
- ✅ Can manage users (view all)
- ✅ Can update user roles
- ✅ Can update user status

**Analyst Role Tests:**
- ✅ Can create transactions
- ✅ Can view transactions
- ✅ Can access dashboard
- ✅ Cannot manage users (403)
- ✅ Cannot update user roles (403)

**Viewer Role Tests:**
- ✅ Cannot create transactions (403)
- ✅ Can view transactions
- ✅ Cannot update transactions (403)
- ✅ Cannot delete transactions (403)
- ✅ Can view dashboard
- ✅ Cannot manage users (403)

**Permission Enforcement:**
- ✅ Invalid token rejected (401)
- ✅ Missing token rejected (401)
- ✅ Different roles have different permissions
- ✅ User roles enforced across all operations

---

### ✅ Authentication Tests (auth.test.js) - **10/10 PASSING**
Tests registration, login, and token validation.

---

### 📊 Transaction Tests (transaction.test.js)
Tests transaction CRUD operations.

---

### 👥 User Management Tests (user.test.js)
Tests user management endpoints.

---

### 📈 Dashboard Tests (dashboard.test.js)
Tests analytics and dashboard endpoints.

---

## 🔄 Test Execution Flow

```
npm test
   ↓
npm run seed:test
   ↓
seeds: finance_db_test
   └─ Creates admin@zorvyn.com (role: admin)
   └─ Creates analyst@zorvyn.com (role: analyst)
   └─ Creates viewer@zorvyn.com (role: viewer)
   ↓
jest --detectOpenHandles --forceExit
   ↓
jest.setup.js:beforeAll()
   └─ Connects to finance_db_test
   └─ Loads global.testUsers from pre-created users
   ↓
Each test file:
   └─ Login with test user credentials
   └─ Run test cases
   └─ Verify permissions
   ↓
jest.setup.js:afterAll()
   └─ Disconnect from test database
   ↓
Tests complete ✅
```

---

## 🛠️ How the Test Setup Works

### 1. Environment Setup (`jest.setup.js`)
```javascript
// Set NODE_ENV to 'test' (disables rate limiting)
process.env.NODE_ENV = 'test'

// Connect to TEST database only
await mongoose.connect(process.env.TEST_MONGO_URI)

// Load test credentials globally
global.testUsers = {
  admin: { email: 'test-admin@zorvyn.com', password: 'TestAdmin@123' },
  analyst: { email: 'test-analyst@zorvyn.com', password: 'TestAnalyst@123' },
  viewer: { email: 'test-viewer@zorvyn.com', password: 'TestViewer@123' }
}
```

### 2. Test Execution
```javascript
// In each test file:
beforeAll(async () => {
  // Login with pre-created user
  const login = await request(app)
    .post('/api/auth/login')
    .send({
      email: global.testUsers.admin.email,
      password: global.testUsers.admin.password
    })
  
  adminToken = login.body.token
})

// Use token for all subsequent requests
test('Admin can create transactions', async () => {
  const response = await request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({...})
  
  expect(response.status).toBe(201)
})
```

---

## 📁 Project Structure

```
Zorvyn/
├── scripts/
│   └── seedTestDB.js          ← Seeds test database with users
├── src/
│   ├── config/
│   │   ├── db.js              ← Production database
│   │   └── testDB.js          ← Test database config
│   ├── app.js
│   └── ...
├── tests/
│   ├── auth.test.js           ← Auth tests (10 tests)
│   ├── transaction.test.js    ← Transaction tests
│   ├── dashboard.test.js      ← Dashboard tests
│   ├── user.test.js           ← User management tests
│   ├── rbac.test.js           ← Old RBAC tests (for reference)
│   └── rbac-precreated.test.js ← New RBAC tests (21 tests) ✨
├── jest.config.js             ← Jest configuration
├── jest.setup.js              ← Test setup & DB connection
├── package.json               ← Scripts updated
├── .env                       ← Added TEST_MONGO_URI
└── TEST_RESULTS.md
```

---

## ⚙️ Key Benefits of This Approach

✅ **Isolation:** Test database is completely separate from production  
✅ **Consistency:** Same test users for every test run  
✅ **Reliability:** No race conditions from user creation  
✅ **Speed:** No time spent creating users during tests  
✅ **Debuggability:** Can manually inspect test database  
✅ **Flexibility:** Easy to add more pre-created test users  

---

## 🔍 Verifying Test Results

### Expected Output (21/21 Passing)
```
 PASS  tests/rbac-precreated.test.js
  RBAC (Role-Based Access Control) - Using Pre-Created Users
    Admin Role - Full Access
      √ Admin can create transactions (45 ms)
      √ Admin can view all transactions (56 ms)
      ...
    Analyst Role - Limited Access
      √ Analyst can create transactions (20 ms)
      ...
    Viewer Role - Read-Only Access
      √ Viewer CANNOT create transactions (14 ms)
      ...

Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
```

---

## 🚨 Troubleshooting

### Issue: "Cannot connect to test database"
**Solution:** Ensure MongoDB is running and TEST_MONGO_URI in .env is correct
```bash
# Check MongoDB connection
mongosh mongodb://localhost:27017/finance_db_test
```

### Issue: "Test user credentials not found"
**Solution:** Run seed script first
```bash
npm run seed:test
```

### Issue: "Rate limiting still active in tests"
**Solution:** Verify NODE_ENV='test' in jest.setup.js and rate limiter has `skip` function

### Issue: "Token invalid/expired"
**Solution:** Tokens are valid for 7 days. Only issue if .env JWT_EXPIRES_IN changed.

---

## 📊 Test Coverage Goals

| Component | Tests | Status |
|-----------|-------|--------|
| Authentication | 10 | ✅ PASSING |
| RBAC | 21 | ✅ PASSING |
| Transactions | TBD | 🔄 In Progress |
| Dashboard | TBD | 🔄 In Progress |
| User Management | TBD | 🔄 In Progress |
| **Total** | **31+** | ✅ **Core Tests Passing** |

---

## 📝 Adding New Tests

### Example: Add a Transaction Test
```javascript
describe('Transactions', () => {
  let adminToken

  beforeAll(async () => {
    // Login with pre-created admin
    const login = await request(app)
      .post('/api/auth/login')
      .send({
        email: global.testUsers.admin.email,
        password: global.testUsers.admin.password
      })
    adminToken = login.body.token
  })

  test('Should create a transaction', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 10000,
        type: 'income',
        category: 'salary'
      })

    expect(response.status).toBe(201)
  })
})
```

---

## ✨ Summary

- ✅ Separate test database configured
- ✅ Pre-created admin, analyst, viewer users
- ✅ Automated seeding via `npm run seed:test`
- ✅ 21 RBAC tests passing with proper role enforcement
- ✅ Token-based authentication working
- ✅ Ready for CI/CD integration

Run `npm test` to start testing! 🚀
