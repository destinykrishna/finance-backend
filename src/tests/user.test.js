const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');

// Test constants - Generic test credentials
const TEST_CREDENTIALS = {
  password: 'UserPass@123'
};

let adminToken;
let adminUserId;
let testUserId;

describe('User Management Endpoints', () => {
  beforeAll(async () => {
    // Login with pre-created admin user
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: global.testUsers.admin.email,
        password: global.testUsers.admin.password
      });

    adminToken = adminRes.body.token;
    const adminData = await User.findOne({ email: global.testUsers.admin.email });
    adminUserId = adminData._id;

    // Use pre-created viewer user
    const viewerData = await User.findOne({ email: global.testUsers.viewer.email });
    testUserId = viewerData._id;
  });

  afterAll(async () => {
    // No cleanup needed - using pre-created users
  });

  describe('GET /api/users - Retrieve All Users', () => {
    test('Should retrieve all users (admin only)', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      response.body.data.forEach(user => {
        expect(user).toHaveProperty('_id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
      });
    });

    test('Should not include password in user data', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('PUT /api/users/:id/role - Update User Role', () => {
    test('Should update user role to analyst', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'analyst'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('role', 'analyst');
    });

    test('Should update user role to admin', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'admin'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('role', 'admin');
    });

    test('Should fail with invalid role', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'invalid_role'
        });

      expect(response.status).toBe(400);
    });

    test('Should fail for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/users/${fakeId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'admin'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    test('Should require admin role', async () => {
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Regular User',
          email: 'regular-user@zorvyn.com',
          password: TEST_CREDENTIALS.password
        });

      const userToken = userRes.body.token;

      const response = await request(app)
        .put(`/api/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          role: 'admin'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');

      // Cleanup
      await User.deleteOne({ email: 'regular-user@zorvyn.com' });
    });
  });

  describe('PUT /api/users/:id/status - Update User Status', () => {
    test('Should deactivate user', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('isActive', false);
    });

    test('Should activate user', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: true
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('isActive', true);
    });

    test('Should fail for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/users/${fakeId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    test('Should require admin role', async () => {
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'another-user@zorvyn.com',
          password: TEST_CREDENTIALS.password
        });

      const userToken = userRes.body.token;

      const response = await request(app)
        .put(`/api/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          isActive: false
        });

      expect(response.status).toBe(403);

      // Cleanup
      await User.deleteOne({ email: 'another-user@zorvyn.com' });
    });
  });

  describe('User Endpoint Authorization', () => {
    test('Should prevent access without token', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
    });

    test('Should prevent access with invalid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });
});
