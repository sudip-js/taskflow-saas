# 📘 Task Flow SaaS – API Documentation

Version: v1  
Base Path: /api/v1

---

# 1️⃣ Overview

Task Flow SaaS is a multi-tenant task management system with:

- JWT Authentication
- Organization Management
- Role-Based Access Control (RBAC)
- Secure Token Handling (Access + Refresh)

---

# 2️⃣ Base URL

## Development

http://localhost:5000/api/v1

## Production

https://api.taskflow.com/api/v1

---

# 3️⃣ Authentication

Protected routes require:

Authorization: Bearer <accessToken>

- Access Token → Returned in login response
- Refresh Token → Stored in httpOnly cookie
- Token Type → JWT

---

# 4️⃣ Standard API Response Format

## ✅ Success Response

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

## ❌ Error Response

```json
{
  "success": false,
  "message": "Something went wrong",
  "error": {
    "code": "ERROR_CODE",
    "details": "Error description"
  }
}
```

---

# 5️⃣ HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 500  | Internal Server Error |

---

# 6️⃣ AUTH APIs

---

## 6.1 Register User

POST /auth/register

### Body

```json
{
  "name": "Sudip",
  "email": "sudip@example.com",
  "password": "Password@123"
}
```

### Response

```json
{
  "success": true,
  "message": "User registered successfully. Please verify email."
}
```

---

## 6.2 Verify Email

GET /auth/verify-email?token=VERIFICATION_TOKEN

### Response

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## 6.3 Resend Verification Email

POST /auth/resend-verification-email

### Body

```json
{
  "email": "sudip@example.com"
}
```

---

## 6.4 Login

POST /auth/login

### Body

```json
{
  "email": "sudip@example.com",
  "password": "Password@123"
}
```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "JWT_TOKEN",
    "user": {
      "_id": "userId",
      "name": "Sudip",
      "email": "sudip@example.com"
    }
  }
}
```

---

## 6.5 Refresh Token

POST /auth/refresh-token

- Uses httpOnly refresh token cookie
- Returns new access token

---

## 6.6 Logout

POST /auth/logout

- Clears refresh token cookie

---

## 6.7 Get Current User

GET /auth/me

Authorization Required

### Response

```json
{
  "success": true,
  "data": {
    "_id": "userId",
    "name": "Sudip",
    "email": "sudip@example.com"
  }
}
```

---

## 6.8 Forgot Password

POST /auth/forgot-password

### Body

```json
{
  "email": "sudip@example.com"
}
```

---

## 6.9 Reset Password

POST /auth/reset-password

### Body

```json
{
  "token": "RESET_TOKEN",
  "newPassword": "NewPassword@123"
}
```

---

# 7️⃣ ORGANIZATION APIs

---

## 7.1 Create Organization

POST /organizations

Authorization Required

### Body

```json
{
  "name": "My Organization"
}
```

---

## 7.2 Get My Organizations

GET /organizations

Authorization Required

Returns all organizations where the user is a member.

---

## 7.3 Get Organization By ID

GET /organizations/:orgId

Authorization Required

---

## 7.4 Update Organization

PATCH /organizations/:orgId

Authorization Required  
Role: owner or admin

### Body

```json
{
  "name": "Updated Organization Name"
}
```

---

## 7.5 Delete Organization

DELETE /organizations/:orgId

Authorization Required  
Role: owner only

---

## 7.6 Invite Member

POST /organizations/:orgId/invite

Authorization Required  
Role: owner or admin

### Body

```json
{
  "email": "user@example.com",
  "role": "member"
}
```

---

# 8️⃣ Role-Based Access Control (RBAC)

Organization Roles:

- owner
- admin
- member

### Permissions

| Action              | Owner | Admin | Member |
| ------------------- | ----- | ----- | ------ |
| Update Organization | ✅    | ✅    | ❌     |
| Delete Organization | ✅    | ❌    | ❌     |
| Invite Members      | ✅    | ✅    | ❌     |

---

# 9️⃣ Future Planned APIs

- Task APIs
- Workspace APIs
- Notifications
- Activity Logs
- Billing & Subscription
- Audit Logs

---

# 10️⃣ Notes

- All timestamps are returned in ISO format.
- All IDs are MongoDB ObjectIds.
- Pagination format (for future APIs):

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "totalRecords": 100,
    "totalPages": 10,
    "currentPage": 1,
    "limit": 10
  }
}
```

---

END OF DOCUMENT
