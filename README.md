# 🚀 Task Flow SaaS – Backend

A scalable multi-tenant Task Management SaaS backend built with Node.js, Express, MongoDB, and JWT authentication.

---

## 📌 Overview

Task Flow SaaS is designed to support:

- 🔐 JWT Authentication (Access + Refresh Tokens)
- 🏢 Multi-Organization Architecture
- 👥 Role-Based Access Control (RBAC)
- 📦 RESTful API Structure
- 🔄 Secure Token Rotation
- 📄 Clean API Documentation
- 📁 Scalable Project Architecture

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- TypeScript
- JWT (Access + Refresh Token)
- bcrypt
- Cookie-based Auth (httpOnly)
- Postman (API Testing)

---

## 📂 Project Structure

```
taskflow-backend/
│
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   └── app.ts
│
├── docs/
│   └── api.md
│
├── postman/
│   └── taskflow_collection.json
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/taskflow-backend.git
cd taskflow-backend
```

### 2️⃣ Install Dependencies

```
npm install
```

### 3️⃣ Create Environment File

Create `.env` file in root:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000
```

### 4️⃣ Run Development Server

```
npm run dev
```

Server will run at:

```
http://localhost:5000
```

---

## 🔐 Authentication Flow

1. User registers
2. Email verification
3. User logs in
4. Server returns:
   - Access Token (JWT)
   - Refresh Token (httpOnly cookie)
5. Access token used for protected routes
6. Refresh token used to generate new access token

---

## 🏢 Organization Architecture

Each user can:

- Create organizations
- Join organizations
- Invite members
- Manage organization settings (based on role)

### Roles

- `owner`
- `admin`
- `member`

### Permission Matrix

| Action              | Owner | Admin | Member |
| ------------------- | ----- | ----- | ------ |
| Update Organization | ✅    | ✅    | ❌     |
| Delete Organization | ✅    | ❌    | ❌     |
| Invite Members      | ✅    | ✅    | ❌     |

---

## 📘 API Documentation

Detailed API documentation available at:

```
/docs/api.md
```

---

## 🧪 API Testing

Postman collection available in:

```
/postman/taskflow_collection.json
```

Import into Postman and set environment variables:

```
BASE_URL=http://localhost:5000/api/v1
ACCESS_TOKEN=
```

---

## 📦 Standard API Response Format

### Success

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

### Error

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

## 🔮 Future Roadmap

- ✅ Organization Module
- ⏳ Task Management Module
- ⏳ Workspace Management
- ⏳ Notifications
- ⏳ Billing & Subscription
- ⏳ Audit Logs
- ⏳ Swagger API Docs
- ⏳ CI/CD Deployment

---

## 🛡 Security Practices

- Password hashing using bcrypt
- JWT Access + Refresh Token strategy
- httpOnly secure cookies
- Role-based access control
- Input validation
- Centralized error handling

---

## 👨‍💻 Author

Sudip JS  
Backend Developer | SaaS Builder

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Contribution

Contributions, issues, and feature requests are welcome.

---

## 📢 Status

🚧 Active Development – Building toward production-ready SaaS architecture.
