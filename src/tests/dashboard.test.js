const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');

let adminToken;
let adminUserId;

describe('Dashboard Endpoints', () => {
  beforeAll(async () => {
    // Login with pre-created admin user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: global.testUsers.admin.email,
        password: global.testUsers.admin.password
      });

    adminToken = loginRes.body.token;
    const adminData = await User.findOne({ email: global.testUsers.admin.email });
    adminUserId = adminData._id;

    // Create test transactions
    await Transaction.create([
      {
        userId: adminUserId,
        amount: 50000,
        type: 'income',
        category: 'salary',
        date: new Date('2024-04-01'),
        notes: 'Monthly salary'
      },
      {
        userId: adminUserId,
        amount: 5000,
        type: 'expense',
        category: 'groceries',
        date: new Date('2024-04-02'),
        notes: 'Groceries'
      },
      {
        userId: adminUserId,
        amount: 2000,
        type: 'expense',
        category: 'utilities',
        date: new Date('2024-04-03'),
        notes: 'Electricity bill'
      }
    ]);
  });

  afterAll(async () => {
    // Cleanup test transactions
    await Transaction.deleteMany({ userId: adminUserId });
  });

  describe('GET /api/dashboard/summary - Dashboard Summary', () => {
    test('Should retrieve dashboard summary', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      
      const summary = response.body.data;
      expect(summary).toHaveProperty('totalIncome');
      expect(summary).toHaveProperty('totalExpense');
      expect(summary).toHaveProperty('netBalance');
      
      // Verify calculations
      expect(summary.totalIncome).toBeGreaterThan(0);
      expect(summary.totalExpense).toBeGreaterThan(0);
    });

    test('Should calculate correct balance', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      const { totalIncome, totalExpense, netBalance } = response.body.data;
      expect(netBalance).toBe(totalIncome - totalExpense);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/dashboard/category-wise - Category Breakdown', () => {
    test('Should retrieve category-wise breakdown', async () => {
      const response = await request(app)
        .get('/api/dashboard/category-wise')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      response.body.data.forEach(category => {
        expect(category).toHaveProperty('_id');
        expect(category).toHaveProperty('total');
      });
    });
  });

  describe('GET /api/dashboard/monthly-trends - Monthly Trends', () => {
    test('Should retrieve monthly trends', async () => {
      const response = await request(app)
        .get('/api/dashboard/monthly-trends')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      response.body.data.forEach(month => {
        expect(month).toHaveProperty('_id');
        expect(month._id).toHaveProperty('year');
        expect(month._id).toHaveProperty('month');
        expect(month._id).toHaveProperty('type');
        expect(month).toHaveProperty('total');
      });
    });
  });

  describe('GET /api/dashboard/recent-activity - Recent Activity', () => {
    test('Should retrieve recent activity', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-activity')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      response.body.data.forEach(activity => {
        expect(activity).toHaveProperty('_id');
        expect(activity).toHaveProperty('amount');
        expect(activity).toHaveProperty('type');
      });
    });

    test('Should return limited recent activity', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-activity')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Dashboard Authorization', () => {
    test('Should prevent access without token', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary');

      expect(response.status).toBe(401);
    });

    test('Should prevent access with invalid token', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });
});
