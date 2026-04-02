# Zorvyn - Finance Backend API

A robust, production-ready financial transaction management backend built with Node.js and Express. Zorvyn provides secure user authentication, transaction management, and comprehensive dashboard analytics with role-based access control.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Database Models](#database-models)
- [User Roles & Permissions](#user-roles--permissions)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Role-Based Access Control (RBAC)**: Three user roles - Admin, Analyst, Viewer
- **Transaction Management**: Create, read, update, and soft delete transactions
- **Analytics Dashboard**: Real-time financial summaries and trends
- **Rate Limiting**: Protection against brute force attacks and API abuse
- **Input Validation**: Comprehensive data validation using Joi schema
- **Security**: Helmet.js middleware, CORS, password hashing with bcrypt
- **Logging**: Morgan HTTP request logging
- **MongoDB Integration**: Mongoose ODM for data persistence

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Joi** | Input validation |
| **Helmet** | Security headers |
| **CORS** | Cross-origin requests |
| **Morgan** | HTTP logging |
| **express-rate-limit** | Rate limiting |
| **dotenv** | Environment variables |

## 📦 Prerequisites

- **Node.js** v14+ and npm
- **MongoDB** (local or cloud - MongoDB Atlas)
- **Git** (for version control)

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/destinykrishna/finance-backend.git
cd Zorvyn
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file** in the root directory
```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Configuration](#configuration))

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/your_db
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/zorvyn?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=development
```

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGO_URI` | MongoDB connection string | mongodb://localhost/zorvyn |
| `JWT_SECRET` | Secret key for JWT signing | your-secret-key |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d, 24h |
| `NODE_ENV` | Environment mode | development, production |

## ▶️ Running the Application

### Development Mode
Run with auto-reload using `nodemon`:
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT)

## 📁 Project Structure

```
Zorvyn/
├── src/
│   ├── app.js                      # Express app configuration
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js      # Authentication logic
│   │   ├── user.controller.js      # User management
│   │   ├── transaction.controller.js # Transaction CRUD operations
│   │   └── dashboard.controller.js # Analytics & reporting
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── rbac.middleware.js      # Role authorization
│   │   ├── validate.js             # Input validation
│   │   └── rateLimit.js            # Rate limiting
│   ├── models/
│   │   ├── user.model.js           # User schema
│   │   └── transaction.model.js    # Transaction schema
│   ├── routes/
│   │   ├── auth.route.js           # Authentication endpoints
│   │   ├── transaction.route.js    # Transaction endpoints
│   │   └── dashboard.route.js      # Dashboard endpoints
│   └── validators/
│       ├── auth.validator.js       # Auth input schemas
│       ├── transaction.validator.js # Transaction schemas
│       └── user.validator.js       # User schemas
├── server.js                        # Entry point
├── package.json                     # Dependencies
├── .env                             # Environment variables (not in git)
└── README.md                        # This file
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "viewer"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "65ab123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer"
  },
  "token": "eyJhbGc..."
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "user": {
    "id": "65ab123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer"
  },
  "token": "eyJhbGc..."
}
```

### Transaction Endpoints

All transaction endpoints require authentication. Include the JWT token in the Authorization header:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get All Transactions (with filters)
```http
GET /api/transactions?type=income&category=salary&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10
```

**Parameters:**
- `type` (optional): 'income' or 'expense'
- `category` (optional): Transaction category
- `startDate` (optional): Filter transactions after this date
- `endDate` (optional): Filter transactions before this date
- `page` (default: 1): Page number
- `limit` (default: 10): Items per page

**Response (200 OK)**
```json
{
  "success": true,
  "total": 152,
  "page": 1,
  "data": [
    {
      "_id": "65ab123...",
      "amount": 5000,
      "type": "income",
      "category": "salary",
      "date": "2024-04-01T10:30:00Z",
      "notes": "Monthly salary",
      "createdBy": { "_id": "...", "name": "John Doe" },
      "isDeleted": false,
      "createdAt": "2024-04-01T10:30:00Z",
      "updatedAt": "2024-04-01T10:30:00Z"
    }
  ]
}
```

#### Create Transaction
```http
POST /api/transactions
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "amount": 2000,
  "type": "expense",
  "category": "groceries",
  "date": "2024-04-02",
  "notes": "Weekly groceries"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": { ... transaction object ... }
}
```

#### Update Transaction
```http
PUT /api/transactions/:id
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "amount": 2500,
  "category": "food & groceries"
}
```

#### Delete Transaction (Soft Delete)
```http
DELETE /api/transactions/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Dashboard Endpoints

#### Get Summary
```http
GET /api/dashboard/summary
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "totalIncome": 50000,
    "totalExpense": 15000,
    "netBalance": 35000
  }
}
```

#### Get Category-wise Summary
```http
GET /api/dashboard/category-wise
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Monthly Trends
```http
GET /api/dashboard/monthly-trends
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Recent Activity
```http
GET /api/dashboard/recent-activity
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🔒 Security Features

### Rate Limiting
- **Global**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes (brute force prevention)
- **API**: 50 requests per 15 minutes

### Security Headers
- Helmet.js protects against common vulnerabilities
- CORS configured for cross-origin requests
- Password hashing with bcrypt (salt rounds: 12)

### Input Validation
- All inputs validated using Joi schemas
- Request body validation at middleware level
- Type checking and constraint enforcement

### Authentication & Authorization
- JWT-based stateless authentication
- Role-Based Access Control (RBAC)
- Token expiration: 7 days (configurable)
- Active user status verification

## 👥 User Roles & Permissions

| Role | Get Transactions | Create | Update | Delete | Analytics |
|------|-----------------|--------|--------|--------|-----------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ (All) |
| **Analyst** | ✅ | ✅ | ✅ | ❌ | ✅ (Limited) |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ✅ (Read-only) |

## 📊 Database Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (admin, analyst, viewer),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Transaction Model
```javascript
{
  amount: Number (required),
  type: String (income, expense),
  category: String (required),
  date: Date (default: now),
  notes: String,
  createdBy: ObjectId (ref: User),
  isDeleted: Boolean (soft delete, default: false),
  timestamps: true
}
```

## ❌ Error Handling

All errors follow a consistent response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details (if available)"
}
```

### Common Error Codes

| Status | Code | Message |
|--------|------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

## 🧪 Testing

To test the API, you can use:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [cURL](https://curl.se/)
- [Thunder Client](https://www.thunderclient.com/) (VS Code extension)

Example with cURL:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Transactions (replace TOKEN with actual JWT)
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer TOKEN"
```

## 🚧 Future Enhancements

- [ ] Email verification on registration
- [ ] Password reset functionality
- [ ] Transaction categorization improvements
- [ ] Monthly/yearly reports export (PDF, CSV)
- [ ] Budget tracking and alerts
- [ ] Multi-currency support
- [ ] API documentation with Swagger/OpenAPI
- [ ] Unit and integration tests
- [ ] Caching layer (Redis)
- [ ] WebSocket support for real-time updates

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the **ISC License** - see [LICENSE](LICENSE) file for details.

## 📧 Support

For support, email or open an issue in the [repository](https://github.com/destinykrishna/finance-backend/issues).

## 📞 Contact

- **Developer**: Krishna
- **Repository**: [destinykrishna/finance-backend](https://github.com/destinykrishna/finance-backend)

---

**Last Updated**: April 2, 2026  
**Version**: 1.0.0
