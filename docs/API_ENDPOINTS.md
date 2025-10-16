# Backend API Endpoints Documentation

**Base URL**: `http://localhost:3000/api/v1`
**Authentication**: Bearer token in `Authorization` header

---

## 📋 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Profile Endpoints](#user-profile-endpoints)
3. [Admin - Tenant Management](#admin---tenant-management)
4. [Admin - User Management](#admin---user-management)
5. [Admin - Monitoring](#admin---monitoring)
6. [Health Check](#health-check)

---

## Authentication Endpoints

### POST `/auth/login`
**Description**: User login with email and password

**Access**: Public (rate limited: 5 attempts per 15 minutes)

**Request Body**:
```json
{
  "email": "admin@pharmacy.com",
  "password": "SuperAdmin123!"
}
```

**Response** (201 Created):
```json
{
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "a1b2c3d4...",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": {
      "id": "uuid",
      "email": "admin@pharmacy.com",
      "name": "Admin Name",
      "userType": "SUPER_ADMIN"
    }
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded

---

### POST `/auth/system/login`
**Description**: System administrator login (Super Admin only)

**Access**: Public (rate limited: 5 attempts per 15 minutes)

**Request Body**:
```json
{
  "email": "super@admin.com",
  "password": "SecurePassword123!"
}
```

**Response**: Same as `/auth/login`

---

### POST `/auth/refresh`
**Description**: Refresh access token using refresh token

**Access**: Public (rate limited: 10 attempts per 5 minutes)

**Request Body**:
```json
{
  "refreshToken": "a1b2c3d4..."
}
```

**Response** (201 Created):
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "new_token_here",
  "expiresIn": 900
}
```

---

### POST `/auth/logout`
**Description**: Logout user and invalidate refresh token

**Access**: Protected (JWT required)

**Request Body**:
```json
{
  "refreshToken": "a1b2c3d4..."
}
```

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

---

## User Profile Endpoints

### GET `/profile`
**Description**: Get current authenticated user's profile

**Access**: Protected (JWT required)

**Response** (200 OK):
```json
{
  "data": {
    "id": "b2dbe222-6b40-4e50-9f8f-da4faef843e4",
    "email": "admin@pharmacy.com",
    "name": "John Doe",
    "phone": "+201234567890",
    "profilePicture": "https://example.com/profile.jpg",
    "userType": "SUPER_ADMIN",
    "language": "EN",
    "emailVerified": true,
    "createdAt": "2025-09-01T10:00:00.000Z",
    "updatedAt": "2025-09-18T12:00:00.000Z",
    "onboardingCompleted": true,
    "onboardingCompletedAt": "2025-09-01T11:30:00.000Z"
  }
}
```

---

### PATCH `/profile`
**Description**: Update user profile (name, phone, language, profile picture)

**Access**: Protected (JWT required)

**Request** (multipart/form-data):
```
name: "Ahmed Yahia"
phone: "+201009315155"
language: "AR"
profilePicture: <file>
```

**Response** (200 OK):
```json
{
  "data": {
    "id": "uuid",
    "email": "admin@pharmacy.com",
    "name": "Ahmed Yahia",
    "phone": "+201009315155",
    "userType": "SUPER_ADMIN",
    "language": "AR",
    "emailVerified": true,
    "createdAt": "2025-09-01T10:00:00.000Z",
    "updatedAt": "2025-09-18T12:00:00.000Z"
  }
}
```

---

### POST `/profile/email/request`
**Description**: Request email change by sending OTP to new email

**Access**: Protected (JWT required)

**Request Body**:
```json
{
  "newEmail": "newemail@pharmacy.com"
}
```

**Response** (200 OK):
```json
{
  "message": "OTP sent to new email address"
}
```

---

### POST `/profile/email/verify`
**Description**: Verify OTP and complete email change

**Access**: Protected (JWT required)

**Request Body**:
```json
{
  "otp": "123456"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "id": "uuid",
    "email": "newemail@pharmacy.com",
    "name": "John Doe",
    "emailVerified": true
  }
}
```

---

### DELETE `/profile/picture`
**Description**: Delete user's profile picture

**Access**: Protected (JWT required)

**Response** (200 OK):
```json
{
  "message": "Profile picture deleted successfully"
}
```

---

## Admin - Tenant Management

### GET `/api/admin/tenants`
**Description**: List all pharmacy tenants with filtering and pagination

**Access**: Protected (Super Admin only)

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional) - search by name or code
- `status` (string, optional) - ACTIVE, SUSPENDED, TRIAL, INACTIVE

**Example**: `/api/admin/tenants?page=1&status=ACTIVE&search=pharmacy`

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "37a4b43c-b6c2-4e1a-8b7b-982cda3b1def",
      "name": "ABC Pharmacy",
      "code": "abc-pharmacy",
      "status": "ACTIVE",
      "subscriptionPlan": "PROFESSIONAL",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-09-18T12:00:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### GET `/api/admin/tenants/:id`
**Description**: Get specific tenant details

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "data": {
    "id": "37a4b43c-b6c2-4e1a-8b7b-982cda3b1def",
    "name": "ABC Pharmacy",
    "code": "abc-pharmacy",
    "status": "ACTIVE",
    "subscriptionPlan": "PROFESSIONAL",
    "billingEmail": "billing@abc-pharmacy.com",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-09-18T12:00:00Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "statusCode": 404,
  "message": "Tenant not found"
}
```

---

### POST `/api/admin/tenants`
**Description**: Create new tenant

**Access**: Protected (Super Admin only)

**Request Body**:
```json
{
  "name": "New Pharmacy",
  "code": "new-pharmacy",
  "subscriptionPlan": "BASIC",
  "billingEmail": "billing@newpharmacy.com"
}
```

**Response** (201 Created):
```json
{
  "data": {
    "id": "new-uuid",
    "name": "New Pharmacy",
    "code": "new-pharmacy",
    "status": "ACTIVE",
    "subscriptionPlan": "BASIC",
    "createdAt": "2025-09-18T12:00:00Z",
    "updatedAt": "2025-09-18T12:00:00Z"
  }
}
```

---

### PATCH `/api/admin/tenants/:id`
**Description**: Update tenant information

**Access**: Protected (Super Admin only)

**Request Body**:
```json
{
  "name": "Updated Pharmacy Name",
  "subscriptionPlan": "ENTERPRISE",
  "billingEmail": "newemail@pharmacy.com"
}
```

**Response** (200 OK): Updated tenant object

---

### POST `/api/admin/tenants/:id/suspend`
**Description**: Suspend a tenant with reason

**Access**: Protected (Super Admin only)

**Request Body**:
```json
{
  "reason": "Payment overdue"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "id": "uuid",
    "name": "Pharmacy",
    "status": "SUSPENDED",
    "suspendedAt": "2025-09-18T12:00:00Z",
    "suspendedReason": "Payment overdue"
  }
}
```

---

### POST `/api/admin/tenants/:id/activate`
**Description**: Activate a suspended tenant

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "data": {
    "id": "uuid",
    "name": "Pharmacy",
    "status": "ACTIVE",
    "suspendedAt": null
  }
}
```

---

### DELETE `/api/admin/tenants/:id`
**Description**: Delete (soft delete) a tenant

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "message": "Tenant deleted successfully"
}
```

---

### GET `/api/admin/tenants/:id/stats`
**Description**: Get tenant statistics

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "data": {
    "totalUsers": 25,
    "activeBranches": 3,
    "totalInventoryItems": 1250,
    "totalOrders": 450,
    "lastActivity": "2025-09-18T12:00:00Z"
  }
}
```

---

## Admin - User Management

### GET `/api/v1/admin/users`
**Description**: List all users across all tenants

**Access**: Protected (Super Admin only)

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional) - search by name or email
- `userType` (string, optional) - SUPER_ADMIN, TENANT_ADMIN, PHARMACIST, etc.
- `isActive` (boolean, optional) - true or false

**Example**: `/api/v1/admin/users?page=1&userType=PHARMACIST&isActive=true`

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "user-uuid",
      "email": "pharmacist@pharmacy.com",
      "firstName": "Ahmed",
      "lastName": "Abdo",
      "userType": "PHARMACIST",
      "isActive": true,
      "lastLogin": "2025-09-18T11:30:00Z",
      "failedLoginAttempts": 0,
      "tenant": {
        "id": "tenant-uuid",
        "name": "ABC Pharmacy",
        "code": "abc-pharmacy",
        "status": "ACTIVE"
      },
      "createdAt": "2025-09-01T00:00:00Z",
      "updatedAt": "2025-09-18T12:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### GET `/api/v1/admin/users/:id`
**Description**: Get specific user details

**Access**: Protected (Super Admin only)

**Response** (200 OK): Single user object (same structure as list)

---

### POST `/api/v1/admin/users/:id/reset-password`
**Description**: Reset user password to a new value

**Access**: Protected (Super Admin only)

**Request Body**:
```json
{
  "newPassword": "NewSecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset successfully"
}
```

---

### POST `/api/v1/admin/users/:id/unlock`
**Description**: Unlock user account after failed login attempts

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "message": "User account unlocked successfully"
}
```

---

### POST `/api/v1/admin/users/:id/lock`
**Description**: Manually lock user account with reason

**Access**: Protected (Super Admin only)

**Request Body**:
```json
{
  "reason": "Suspicious activity detected"
}
```

**Response** (200 OK):
```json
{
  "message": "User account locked successfully"
}
```

---

### POST `/api/v1/admin/users/:id/deactivate`
**Description**: Deactivate user account

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "data": {
    "id": "uuid",
    "email": "user@pharmacy.com",
    "isActive": false
  }
}
```

---

### POST `/api/v1/admin/users/:id/activate`
**Description**: Activate user account

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "data": {
    "id": "uuid",
    "email": "user@pharmacy.com",
    "isActive": true
  }
}
```

---

### GET `/api/v1/admin/users/:id/activity`
**Description**: Get user activity history

**Access**: Protected (Super Admin only)

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "activity-uuid",
      "action": "LOGIN",
      "createdAt": "2025-09-18T12:00:00Z",
      "details": {
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0..."
      }
    }
  ],
  "meta": {
    "total": 145,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Admin - Monitoring

### GET `/api/v1/admin/monitoring/health`
**Description**: Get overall system health status

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "data": {
    "status": "healthy",
    "uptime": 86400,
    "timestamp": "2025-09-18T12:00:00Z",
    "services": [
      {
        "name": "PostgreSQL",
        "status": "up",
        "responseTime": 2
      },
      {
        "name": "Redis",
        "status": "up",
        "responseTime": 1
      },
      {
        "name": "Bull Queues",
        "status": "up",
        "responseTime": 3
      }
    ]
  }
}
```

---

### GET `/api/v1/admin/monitoring/database`
**Description**: Get database metrics and statistics

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "data": {
    "databaseSize": "1.2 GB",
    "connections": {
      "total": 50,
      "active": 12,
      "idle": 38
    },
    "topTables": [
      {
        "tablename": "users",
        "size": "250 MB"
      },
      {
        "tablename": "conversations",
        "size": "180 MB"
      }
    ]
  }
}
```

---

### GET `/api/v1/admin/monitoring/redis`
**Description**: Get Redis cache metrics

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "data": {
    "status": "up",
    "connectedClients": 15,
    "usedMemory": "128 MB",
    "usedMemoryPeak": "256 MB",
    "totalCommandsProcessed": 1500000,
    "instantaneousOpsPerSec": 250,
    "keyspaceHits": 900000,
    "keyspaceMisses": 100000,
    "evictedKeys": 5000,
    "responseTime": 1
  }
}
```

---

### GET `/api/v1/admin/monitoring/whatsapp`
**Description**: Get WhatsApp integration status

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "data": {
    "status": "up",
    "accountSid": "AC1234567890abcdef",
    "phoneNumber": "+14155238886",
    "messagesLast24h": 2450,
    "responseTime": 150,
    "lastMessageSent": "2025-09-18T11:59:00Z"
  }
}
```

---

### GET `/api/v1/admin/monitoring/api-metrics`
**Description**: Get API performance metrics

**Access**: Protected (Super Admin only)

**Response** (200 OK):
```json
{
  "data": {
    "totalRequests": 50000,
    "averageResponseTime": 45,
    "errorRate": 0.02,
    "requestsPerMinute": 35,
    "endpoints": [
      {
        "method": "GET",
        "path": "/api/v1/auth/login",
        "count": 5000,
        "averageTime": 150
      },
      {
        "method": "POST",
        "path": "/api/v1/profile",
        "count": 10000,
        "averageTime": 25
      }
    ]
  }
}
```

---

## Health Check

### GET `/health`
**Description**: Simple health check endpoint (no authentication required)

**Access**: Public

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-09-18T12:00:00.000Z",
  "uptime": 86400,
  "environment": "development",
  "version": "1.0.0"
}
```

---

## Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists (e.g., duplicate tenant code) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Authentication Token

All protected endpoints require an `Authorization` header with Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Access tokens expire in **15 minutes**. Use the `/auth/refresh` endpoint with your refresh token to get a new access token.

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 attempts | 15 minutes |
| `/auth/system/login` | 5 attempts | 15 minutes |
| `/auth/refresh` | 10 attempts | 5 minutes |
| `/profile/email/request` | 3 attempts | 1 hour |

---

## Error Response Format

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "BadRequest"
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination starts at page 1 (not 0)
- List responses always include `meta` object with pagination info
- Profile endpoints can have either `.data.data` or direct `.data` based on response wrapper
- Soft deletes mean data is marked as deleted but not removed from database

