const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');

let adminToken, analystToken, viewerToken;
let adminUserId, analystUserId, viewerUserId;

describe('RBAC (Role-Based Access Control) - Using Pre-Created Users', () => {
  beforeAll(async () => {
    // Login with pre-created admin user
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: global.testUsers.admin.email,
        password: global.testUsers.admin.password,
      });

    adminToken = adminLogin.body.token;
    const adminData = await User.findOne({ email: global.testUsers.admin.email });
    adminUserId = adminData._id;

    console.log('✅ Admin token obtained');

    // Login with pre-created analyst user
    const analystLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: global.testUsers.analyst.email,
        password: global.testUsers.analyst.password,
      });

    analystToken = analystLogin.body.token;
    const analystData = await User.findOne({ email: global.testUsers.analyst.email });
    analystUserId = analystData._id;

    console.log('✅ Analyst token obtained');

    // Login with pre-created viewer user
    const viewerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: global.testUsers.viewer.email,
        password: global.testUsers.viewer.password,
      });

    viewerToken = viewerLogin.body.token;
    const viewerData = await User.findOne({ email: global.testUsers.viewer.email });
    viewerUserId = viewerData._id;

    console.log('✅ Viewer token obtained');
  });

  describe('Admin Role - Full Access', () => {
    test('Admin can create transactions', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 10000,
          type: 'income',
          category: 'bonus',
          notes: 'Admin bonus'
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('amount', 10000);
    });

    test('Admin can view all transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Admin can access dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    test('Admin can manage users (view all)', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Admin can update user roles', async () => {
      const response = await request(app)
        .put(`/api/users/${viewerUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'analyst'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('role', 'analyst');

      // Reset to viewer
      await User.findByIdAndUpdate(viewerUserId, { role: 'viewer' });
    });

    test('Admin can update user status', async () => {
      const response = await request(app)
        .put(`/api/users/${viewerUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('isActive', false);

      // Reset to active
      await User.findByIdAndUpdate(viewerUserId, { isActive: true });
    });
  });

  describe('Analyst Role - Limited Access', () => {
    test('Analyst can create transactions', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          amount: 8000,
          type: 'expense',
          category: 'utilities'
        });

      expect(response.status).toBe(201);
    });

    test('Analyst can view transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(response.status).toBe(200);
    });

    test('Analyst can access dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(response.status).toBe(200);
    });

    test('Analyst CANNOT manage users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(response.status).toBe(403);
    });

    test('Analyst CANNOT update user roles', async () => {
      const response = await request(app)
        .put(`/api/users/${viewerUserId}/role`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          role: 'admin'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Viewer Role - Read-Only Access', () => {
    test('Viewer CANNOT create transactions', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 3000,
          type: 'expense',
          category: 'entertainment'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    test('Viewer can view transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
    });

    test('Viewer CANNOT update transactions', async () => {
      // First, create a transaction as admin to update
      const createRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 5000,
          type: 'expense',
          category: 'test'
        });

      const transactionId = createRes.body.data._id;

      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 99999
        });

      expect(response.status).toBe(403);
    });

    test('Viewer CANNOT delete transactions', async () => {
      const transactions = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${adminToken}`);

      if (transactions.body.data.length > 0) {
        const transactionId = transactions.body.data[0]._id;

        const response = await request(app)
          .delete(`/api/transactions/${transactionId}`)
          .set('Authorization', `Bearer ${viewerToken}`);

        expect(response.status).toBe(403);
      }
    });

    test('Viewer can view dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
    });

    test('Viewer CANNOT manage users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Permission Enforcement', () => {
    test('Invalid token is rejected', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });

    test('Missing token is rejected', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
    });

    test('Users from different roles have different permissions', async () => {
      // Admin can access user management
      const adminRes = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);

      // Analyst cannot
      const analystRes = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(analystRes.status).toBe(403);

      // Viewer cannot
      const viewerRes = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(viewerRes.status).toBe(403);
    });
  });

  describe('Role Consistency', () => {
    test('User roles are enforced across all operations', async () => {
      // Get user list to verify roles
      const usersRes = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const users = usersRes.body.data;
      const admin = users.find(u => u._id === adminUserId.toString());
      const analyst = users.find(u => u._id === analystUserId.toString());
      const viewer = users.find(u => u._id === viewerUserId.toString());

      expect(admin.role).toBe('admin');
      expect(analyst.role).toBe('analyst');
      expect(viewer.role).toBe('viewer');
    });
  });
});
