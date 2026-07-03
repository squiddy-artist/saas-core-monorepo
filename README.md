# 🚀 Enterprise-Grade SaaS Monorepo Boilerplate

Welcome to the **SaaS Core Monorepo Boilerplate**, a production-ready, security-hardened starter framework built using a unified workspaces architecture. It is designed to scale dynamically for any digital application—be it high-throughput video streaming platforms, e-commerce networks, public portfolios, or mobile application backends.

---

## 📂 Repository Structure

The project organizes business logics and utilities into modular workspaces:

```text
├── apps/
│   └── api/                  # 🌐 Security-hardened Express / TypeScript REST API
│       ├── src/
│       │   ├── config/       # ⚙️ Env validation & database pooled manager
│       │   ├── controllers/  # 🎮 Auth logical flows
│       │   ├── middleware/   # 🛡️ Helmet, Rate Limiters, JWT, error interceptors
│       │   ├── models/       # 🍃 Mongoose schemas & index models
│       │   ├── routes/       # 🛣️ Sub-routers (Auth, Storage, health checks)
│       │   └── utils/        # 📝 Winston logger and AppError constructs
│       └── tsconfig.json
│
├── packages/
│   ├── shared-types/         # 🧑‍💻 Shared Zod schemas (Registration, Login)
│   └── storage/              # 📦 Generic AWS S3 / Cloudflare R2 client wrapper
│
├── package.json              # 🏗️ Root workspaces controller
└── CHANGELOG.md              # 📜 Project transaction log
```

---

## 🛠️ Technology Stack & Core Features

| Category | Technology | Purpose / Features |
| :--- | :--- | :--- |
| **Monorepo System** | npm Workspaces | Links local packages without deployment overheads |
| **Server Engine** | node.js / Express 5 | Next-generation server routing with native async error handling |
| **Database** | MongoDB / Mongoose | Connection pooling, transaction capability, and rapid index queries |
| **Security Headers** | Helmet | Shields headers against XSS, clickjacking, and MIME injections |
| **Rate Limiter** | express-rate-limit | Mitigates automated brute force attacks on endpoint systems |
| **Session Control** | custom JWT Auth | Token state isolated in HTTP-Only, Secure, SameSite Lax cookies |
| **Token Rotation** | JWT Rotation | Rotating Refresh Tokens with automatic reuse detection |
| **Validation** | Zod | Parses and validates bodies/urls on ingest, filtering unvalidated inputs |
| **Diagnostics** | Winston logger | Context-specific JSON logs |
| **S3 Storage** | AWS SDK v3 S3 | Generates secure PUT/GET pre-signed URLs directly to S3 / Cloudflare R2 |

---

## 🔑 Security Architectures

1.  **🛡️ Cookie-Isolated State:** JWT access tokens are packaged inside secure cookies. This mitigates Cross-Site Scripting (XSS) attack vectors from stealing token payload data.
2.  **🚨 Replay Detection (Token Rotation):** Once a Refresh Token is redeemed, it is destroyed. If a malicious client tries to submit an old refresh token, the server triggers an alarm, instantly revokes all tokens for that user ID, and forces a logout.
3.  **🍃 Connection Pools:** The MongoDB interface enforces pool limits (`maxPoolSize: 50`) and socket timeout triggers to guarantee resource optimization at high scaling scales.
4.  **⏱️ Rate Limiting Policy:** Low attempts window threshold (20 attempts per 15 minutes) on sensitive logins/registers.

---

## 🏃 Quick Start Guide

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB Instance (local or Atlas cloud)

### 1. Build workspaces & dependencies
Install all root modules and trigger workspace linkages:
```bash
# Register all dependencies and local packages
npm install
```

### 2. Configure Environment variables
Create a `.env` file inside `apps/api/` matching these key definitions:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/saas-boilerplate
JWT_SECRET=your_32_character_safe_access_secret_key
JWT_REFRESH_SECRET=your_32_character_safe_refresh_secret_key

# 📦 Cloud Storage Client Options (S3 / R2 / MinIO)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=mock-key-id
AWS_SECRET_ACCESS_KEY=mock-secret-key
AWS_BUCKET_NAME=saas-assets-bucket
AWS_ENDPOINT=https://your-custom-s3-endpoint.com # Optional
```

### 3. Run development service
Boot nodemon compiler within the API directory:
```bash
npm run dev --workspace=api
# Or navigate to apps/api and run:
# npm run dev
```

### 4. Build for Production
To bundle assets and check type-safety:
```bash
npm run build --workspace=api
```
