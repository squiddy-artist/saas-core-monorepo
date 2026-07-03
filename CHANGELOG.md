# 📜 Changelog

All notable changes to the **SaaS Core Monorepo Boilerplate** will be documented in this file.

---

## [1.1.0] - 2026-07-03 (Today) 🚀
### Added
- **Monorepo Workspaces Layout:** Split core libraries into distinct directories (`packages/`) to partition packages from execution apps.
- **Shared Types Module (`@saas-core/shared-types`):** 
  - Added request object validations using Zod schema controls (`RegisterSchema`, `LoginSchema`).
  - Added shared types like request/response interfaces (`RegisterInput`, `LoginInput`, `IUserDTO`, `IAuthResponse`).
- **Storage Utility Module (`@saas-core/storage`):** 
  - Constructed the `S3StorageService` supporting secure AWS AWS SDK v3 client commands.
  - Implemented presigned put URLs (`getUploadPresignedUrl`), download links (`getDownloadPresignedUrl`), and generic bucket asset deletions.
- **Micro-Services Integrations in API:**
  - Integrated `helmet` to manage secure headers.
  - Integrated `express-rate-limit` for rate limiting (global limit and strict auth limit).
  - Integrated `cookie-parser` for secure HTTP-only cookies.
  - Custom Winston logger configuration for logs (`logger.ts`).
  - AppError wrapper rules and subclasses (`BadRequestError`, `UnauthorizedError`, `ConflictError`).
- **Token Rotation & Replay Alarms:** Added refresh token list evaluations during rotation checking. Implemented replay detection that purges active user states to intercept session compromises.

### Changed
- **Modular Directory Refactoring:** Restructured the database layer, controller handlers, routing systems, and configuration variables away from `index.ts` into a clean, layered architectural framework.
- **Database Index Optimization:** Added indexing properties on the User Schema targeting `email` searches, configured automatic mongoose timestamps, and registered active refresh tokens tracking arrays.

---

## [1.0.0] - 2026-07-02 (Initial Version) 📦
### Added
- Basic API engine setup using Express and MongoDB (via Mongoose).
- Single-file user registration (`/api/users/register`) and login (`/api/users/login`) endpoints directly in `apps/api/src/index.ts`.
- Simple plaintext password comparison and salt hashing using `bcryptjs`.
- Standard JSON Web Token issuing on login routes.
- Initial Mongoose User schema structure.
