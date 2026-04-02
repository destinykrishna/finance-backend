# 📚 Zorvyn Finance Backend - API Documentation

**Base URL:** `http://localhost:5000/api`  
**Version:** 1.0.0  
**Last Updated:** April 2, 2026

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Authorization & Roles](#authorization--roles)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#users-endpoints)
  - [Transactions](#transactions-endpoints)
  - [Dashboard](#dashboard-endpoints)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## 🔐 Authentication

All API endpoints (except registration and login) require JWT authentication.

### Token Storage
- Tokens are stored in **HTTP-only cookies** (secure by default)
- Token expires in **7 days**
- Automatically included in requests

### How to Authenticate
1. Register or login to get a token
2. Token is automatically stored in cookies
3. All subsequent requests include the token

```bash
# Example: Using curl with cookies
curl -b "jwt_token=your_token_here" http://localhost:5000/api/users
```

---

## 🎭 Authorization & Roles

The system supports **three user roles** with different permissions:

### Role Permissions Matrix

| Action | Admin | Analyst | Viewer |
|--------|-------|---------|--------|
| Create transactions | ✅ | ✅ | ❌ |
| Read transactions | ✅ | ✅ | ✅ |
| Update transactions | ✅ | ✅ | ❌ |
| Delete transactions | ✅ | ✅ | ❌ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View category breakdown | ✅ | ✅ | ❌ |
| View monthly trends | ✅ | ✅ | ❌ |
| View recent activity | ✅ | ✅ | ✅ |
| Manage users | ✅ | ❌ | ❌ |
| Update user roles | ✅ | ❌ | ❌ |
| Update user status | ✅ | ❌ | ❌ |

**Unauthorized requests return:** `403 Forbidden`

---

## 🔌 API Endpoints

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "60d5ec49c1234567890abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer",
    "isActive": true,
    "createdAt": "2026-04-02T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing/invalid fields or duplicate email
- `422 Unprocessable Entity` - Validation error

---

#### 2. Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "60d5ec49c1234567890abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing credentials
- `401 Unauthorized` - Invalid email or password

---

### Users Endpoints

#### 3. Get All Users
```http
GET /users
Authorization: Bearer {token}
```

**Required Role:** Admin

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49c1234567890abc",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer",
      "isActive": true,
      "createdAt": "2026-04-02T10:00:00.000Z",
      "updatedAt": "2026-04-02T10:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

#### 4. Update User Role
```http
PUT /users/:id/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "analyst"
}
```

**Required Role:** Admin

**Parameters:**
- `id` - User ID (path parameter)
- `role` - New role: `admin`, `analyst`, or `viewer` (body parameter)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "analyst",
    "isActive": true
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid role value
- `404 Not Found` - User not found
- `403 Forbidden` - Insufficient permissions

---

#### 5. Update User Status
```http
PUT /users/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "isActive": false
}
```

**Required Role:** Admin

**Parameters:**
- `id` - User ID (path parameter)
- `isActive` - Active status (body parameter)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "analyst",
    "isActive": false
  }
}
```

---

### Transactions Endpoints

#### 6. Create Transaction
```http
POST /transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 50000,
  "type": "income",
  "category": "salary",
  "date": "2026-04-02T10:00:00Z",
  "notes": "Monthly salary"
}
```

**Required Role:** Admin, Analyst

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | ✅ | Transaction amount (positive) |
| type | string | ✅ | `income` or `expense` |
| category | string | ✅ | Category name (2-50 chars) |
| date | ISO datetime | ❌ | Transaction date (default: now) |
| notes | string | ❌ | Optional notes (max 500 chars) |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890def",
    "amount": 50000,
    "type": "income",
    "category": "salary",
    "date": "2026-04-02T10:00:00.000Z",
    "notes": "Monthly salary",
    "createdBy": "60d5ec49c1234567890abc",
    "isDeleted": false,
    "createdAt": "2026-04-02T10:05:00.000Z",
    "updatedAt": "2026-04-02T10:05:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data or validation errors
- `401 Unauthorized` - Missing token
- `403 Forbidden` - Insufficient permissions

---

#### 7. Get All Transactions
```http
GET /transactions?type=income&category=salary&skip=0&limit=10
Authorization: Bearer {token}
```

**Required Role:** Admin, Analyst, Viewer

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | ❌ | Filter by type: `income` or `expense` |
| category | string | ❌ | Filter by category name |
| skip | number | ❌ | Records to skip (pagination, default: 0) |
| limit | number | ❌ | Records per page (default: 10, max: 100) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49c1234567890def",
      "amount": 50000,
      "type": "income",
      "category": "salary",
      "date": "2026-04-02T10:00:00.000Z",
      "notes": "Monthly salary",
      "createdBy": {
        "_id": "60d5ec49c1234567890abc",
        "name": "John Doe"
      },
      "isDeleted": false,
      "createdAt": "2026-04-02T10:05:00.000Z"
    }
  ]
}
```

---

#### 8. Get Transaction by ID
```http
GET /transactions/:id
Authorization: Bearer {token}
```

**Required Role:** Admin, Analyst, Viewer

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890def",
    "amount": 50000,
    "type": "income",
    "category": "salary",
    "date": "2026-04-02T10:00:00.000Z",
    "notes": "Monthly salary",
    "createdBy": "60d5ec49c1234567890abc",
    "isDeleted": false,
    "createdAt": "2026-04-02T10:05:00.000Z"
  }
}
```

---

#### 9. Update Transaction
```http
PUT /transactions/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 55000,
  "notes": "Updated salary"
}
```

**Required Role:** Admin, Analyst (for own transactions)

**Request Body:** Same as create, but all fields optional

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890def",
    "amount": 55000,
    "type": "income",
    "category": "salary",
    "date": "2026-04-02T10:00:00.000Z",
    "notes": "Updated salary",
    "updatedAt": "2026-04-02T10:10:00.000Z"
  }
}
```

---

#### 10. Delete Transaction (Soft Delete)
```http
DELETE /transactions/:id
Authorization: Bearer {token}
```

**Required Role:** Admin, Analyst

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Transaction deleted successfully",
  "data": {
    "_id": "60d5ec49c1234567890def",
    "isDeleted": true,
    "updatedAt": "2026-04-02T10:15:00.000Z"
  }
}
```

**Note:** Uses soft delete - record marked as deleted but not removed

---

### Dashboard Endpoints

#### 11. Get Dashboard Summary
```http
GET /dashboard/summary
Authorization: Bearer {token}
```

**Required Role:** Admin, Analyst, Viewer

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalIncome": 150000,
    "totalExpense": 45000,
    "netBalance": 105000
  }
}
```

---

#### 12. Get Category-wise Breakdown
```http
GET /dashboard/category-wise
Authorization: Bearer {token}
```

**Required Role:** Admin, Analyst

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": {
        "category": "salary",
        "type": "income"
      },
      "total": 150000,
      "count": 3
    },
    {
      "_id": {
        "category": "groceries",
        "type": "expense"
      },
      "total": 25000,
      "count": 5
    }
  ]
}
```

---

#### 13. Get Monthly Trends
```http
GET /dashboard/monthly-trends
Authorization: Bearer {token}
```

**Required Role:** Admin, Analyst

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": {
        "year": 2026,
        "month": 4,
        "type": "income"
      },
      "total": 150000
    },
    {
      "_id": {
        "year": 2026,
        "month": 4,
        "type": "expense"
      },
      "total": 45000
    }
  ]
}
```

---

#### 14. Get Recent Activity
```http
GET /dashboard/recent-activity
Authorization: Bearer {token}
```

**Required Role:** Admin, Analyst, Viewer

**Response:** `200 OK` (returns up to 10 most recent transactions)
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49c1234567890def",
      "amount": 50000,
      "type": "income",
      "category": "salary",
      "date": "2026-04-02T10:00:00.000Z",
      "createdBy": {
        "_id": "60d5ec49c1234567890abc",
        "name": "John Doe"
      },
      "createdAt": "2026-04-02T10:05:00.000Z"
    }
  ]
}
```

---

## 📤 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | OK | Request succeeded |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Missing/invalid fields |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `422` | Unprocessable Entity | Validation error |
| `500` | Server Error | Unexpected server error |

### Common Error Scenarios

**Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Insufficient Permissions:**
```json
{
  "success": false,
  "message": "Role 'viewer' is not authorized for this action"
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Amount must be a positive number"
}
```

---

## 🚦 Rate Limiting

### Global Rate Limit
- **Limit:** 100 requests per 15 minutes
- **Response on limit exceeded:** `429 Too Many Requests`

### Endpoint-Specific Limits
- **Authentication endpoints:** 5 requests per 15 minutes
- **Dashboard endpoints:** 30 requests per 15 minutes
- **Other endpoints:** 20 requests per 15 minutes

**Rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## 💡 Examples

### Complete Flow Example

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "SecurePass@123"
  }'
```

#### 2. Login (Token automatically stored in cookies)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePass@123"
  }' \
  -c cookies.txt
```

#### 3. Create a Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "amount": 50000,
    "type": "income",
    "category": "salary",
    "notes": "Monthly salary"
  }'
```

#### 4. Get Transactions
```bash
curl -X GET "http://localhost:5000/api/transactions?type=income&skip=0&limit=10" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

#### 5. Get Dashboard Summary
```bash
curl -X GET http://localhost:5000/api/dashboard/summary \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## 🔍 Testing the API

### Using Postman
1. Import the API into Postman
2. Set base URL to `http://localhost:5000/api`
3. Use "Manage Cookies" to store JWT tokens
4. Start with `/auth/register` or `/auth/login`

### Using cURL
```bash
# Save token to file
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}' | jq -r '.token')

# Use token in subsequent requests
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN"
```

### Using JavaScript/Fetch
```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ 
    email: 'user@example.com', 
    password: 'password' 
  })
});

// Get transactions
const txResponse = await fetch('http://localhost:5000/api/transactions', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
});
```

---

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/destinykrishna/finance-backend/issues
- Documentation: See README.md in repository

---

**API Version:** 1.0.0  
**Last Updated:** April 2, 2026  
**Status:** Production Ready
