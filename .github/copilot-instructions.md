# SkillSync - AI Coding Agent Instructions

## Architecture Overview

**SkillSync** is a full-stack internship matching platform with Node.js/Express backend (ES modules) and React 18/Vite frontend. The system supports three distinct user roles: **student**, **company**, and **admin**, each with isolated feature sets and UI layouts.

### Key Architectural Decisions

- **Multi-role single User model**: All users (students, companies, admins) share the `User` model with role-specific embedded fields (`studentProfile`) and references (`company` ObjectId). Companies auto-create a linked `Company` document on registration (`authController.js:47-59`).
- **JWT-based auth with refresh tokens**: Backend uses dual-token system (access 15m + refresh 7d). Frontend stores both in Zustand persist (localStorage) under `auth-storage` key. `apiClient.js` interceptors auto-refresh on 401.
- **Mongoose post-save hooks**: `Application` model automatically updates `Internship.applicationsCount` on save/remove (see `backend/models/Application.js:67-82`). NEVER manually update this field.
- **Standardized API responses**: All endpoints use `successResponse()` and `errorResponse()` helpers from `backend/utils/apiResponse.js` with consistent `{success, message, data}` structure. Controllers use `asyncHandler` wrapper for error handling.

## Critical Developer Workflows

### Option 1: Docker Setup (Recommended)

```pwsh
# 1. Copy and configure environment variables
cp .env.example .env
# Edit with your secrets - MUST change JWT_SECRET and JWT_REFRESH_SECRET

# 2. Build and start all services (MongoDB, Backend, Frontend)
docker-compose up -d --build

# 3. Create admin user (REQUIRED before first login)
docker-compose exec backend node scripts/createAdmin.js

# Access points:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - MongoDB: localhost:27017

# Useful commands:
docker-compose logs -f backend     # View backend logs
docker-compose logs -f frontend    # View frontend logs
docker-compose down                # Stop all services
docker-compose down -v             # Stop and delete all data
```

See `DOCKER.md` for health checks, scaling, volume management, and troubleshooting.

### Option 2: Local Development Setup

#### Backend (Port 5000)

```pwsh
cd backend
npm install
cp .env.example .env
# Edit .env - Configure: MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, PORT
npm run dev           # Starts nodemon with hot reload
```

#### Frontend (Port 5173 via Vite)

```pwsh
cd frontend
npm install
# Create .env with: VITE_API_BASE_URL=http://localhost:5000/api
npm run dev           # Vite dev server with HMR
npm run build         # Production build to dist/
npm run preview       # Preview production build
```

#### Create Admin User (Required First Step)

```pwsh
cd backend
node scripts/createAdmin.js
# Default: admin@skillsync.com / Admin@123
# Override with ADMIN_EMAIL and ADMIN_PASSWORD env vars
```

## Project-Specific Conventions

### Backend Patterns

1. **Route Protection Chain**: Always use `protect` middleware (JWT verification) → `authorize(...roles)` middleware (role checking)

   ```javascript
   // Example: backend/routes/companyRoutes.js:32
   router.use(protect, authorize("company")); // Apply to all routes
   router.post("/internships", validate(internshipSchema), createInternship);
   ```

2. **Model Population Strategy**: Controllers populate refs on read operations, not model defaults

   ```javascript
   // Standard pattern in controllers:
   const internships = await Internship.find()
     .populate("company", "companyName logo location")
     .populate("postedBy", "email");
   ```

3. **File Upload Handling**: Uses Multer middleware (`backend/middleware/upload.js`) with `uploads/` directory. Files stored as `{filename, path, uploadedAt}` objects in models. Access via `/api/files/:filename` endpoint (streaming) or `/uploads/:filename` (static).

   ```javascript
   // Example: Resume upload
   router.put(
     "/profile",
     protect,
     uploadResume.single("resume"),
     updateProfile
   );
   // File accessible at: req.file with {filename, path, mimetype, size}
   ```

4. **Validation Approach**: Joi schemas in `backend/middleware/validator.js` validate request bodies before controller execution. Schema runs with `abortEarly: false` and `stripUnknown: true`.

   ```javascript
   router.post(
     "/internships",
     validate(internshipSchema), // Validates & strips unknown fields
     createInternship
   );
   ```

5. **Error Handling Pattern**: Use `asyncHandler` wrapper (from `errorHandler.js`) for all async controllers. Never use raw try-catch unless specific handling needed.

   ```javascript
   export const getProfile = asyncHandler(async (req, res) => {
     const user = await User.findById(req.user._id);
     return successResponse(res, 200, "Profile fetched", user);
   });
   ```

### Frontend Patterns

1. **Zustand State Management**:

   - `authStore.js`: User auth state (persisted to localStorage as `auth-storage`)
   - `uiStore.js`: UI state (notifications, modals)
   - Access token injected via axios interceptors in `apiClient.js:66-85`

2. **Service Layer Organization**: Each role has dedicated service file (`authService.js`, `studentService.js`, `companyService.js`, `adminService.js`) that wraps `apiClient` calls. **Always use services, never raw axios/fetch.**

   ```javascript
   // Good: Use service layer
   import studentService from "@/services/studentService";
   const applications = await studentService.getMyApplications();

   // Bad: Direct API calls bypass interceptors
   const response = await axios.get("/student/applications");
   ```

3. **Route Structure by Role**:

   - `/student/*` → `StudentLayout` → requires `student` role
   - `/company/*` → `CompanyLayout` → requires `company` role
   - `/admin/*` → `AdminLayout` → requires `admin` role
   - Enforced by `ProtectedRoute` wrapper checking `useAuthStore().user.role`
   - See `App.jsx` for complete route structure

4. **Component Library**: Custom components in `frontend/src/components/common/` follow shadcn/ui patterns with class-variance-authority for variants. Use these instead of creating new primitives.

   ```javascript
   // Use existing components:
   import { Button } from "@/components/common/Button";
   import { Card } from "@/components/common/Card";
   import { Input } from "@/components/common/Input";
   ```

5. **Form Handling**: Uses react-hook-form with zod resolvers for validation. Prefer controlled forms with form state management.

## Data Flow & Integration Points

### Authentication Flow

1. **Login**: `POST /api/auth/login` → Returns `{user, accessToken, refreshToken}`
2. **Frontend storage**: `authService.login()` → `authStore.setAuth()` → Persisted to localStorage under `auth-storage` key
3. **Subsequent requests**: `apiClient` request interceptor (line 66) adds `Authorization: Bearer ${token}` header
4. **Token refresh**: On 401 response, `apiClient` response interceptor (line 95) auto-calls `POST /api/auth/refresh` with `refreshToken` → Updates `authStore` with new access token
5. **Logout**: Clears Zustand state + localStorage, removes auth headers

### Application Submission Flow

1. **Student applies**: `POST /api/student/apply/:internshipId` with `{coverLetter, answers: [{question, answer}]}`
2. **Application creation**: Backend creates `Application` document with `student`, `company`, `internship` refs and `status: 'pending'`
3. **Auto-count update**: Mongoose post-save hook updates `Internship.applicationsCount` automatically (NEVER update manually)
4. **Company views**: `GET /api/company/applications` returns applications filtered by `req.user.company` ObjectId
5. **Status updates**: `PUT /api/company/applications/:id/status` with `{status, note}` → Appends to `statusHistory` array with timestamp and `changedBy` ref

### Internship Posting Flow

1. **Company creates**: `POST /api/company/internships` with internship data (validated by `internshipSchema`)
2. **Backend links**: Sets `company: req.user.company` and `postedBy: req.user._id` automatically
3. **Students browse**: `GET /api/internships` returns all internships with filters (location, type, skills)
4. **Detail view**: `GET /api/internships/:id` populates `company` and `postedBy` refs for display

### Cross-Component Data Requirements

- **Internship details pages** need:
  ```javascript
  .populate('company', 'companyName logo location industry')
  .populate('postedBy', 'email')
  ```
- **Application lists** need:
  ```javascript
  .populate('student', 'email studentProfile.name studentProfile.university')
  .populate('internship', 'title company location')
  .populate('company', 'companyName')
  ```
- **Company operations** MUST verify ownership:
  ```javascript
  // Pattern in company controllers:
  const internship = await Internship.findById(id);
  if (internship.company.toString() !== req.user.company.toString()) {
    return errorResponse(res, 403, "Not authorized");
  }
  ```

## Environment Variables & Configuration

### Backend `.env` (Required Variables)

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/skillsync
MONGO_ROOT_USERNAME=admin  # For Docker only
MONGO_ROOT_PASSWORD=secure_password  # For Docker only

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Admin Account (for scripts/createAdmin.js)
ADMIN_EMAIL=admin@skillsync.com
ADMIN_PASSWORD=Admin@123
```

### Frontend `.env` (Required Variables)

```env
# API Endpoint
VITE_API_BASE_URL=http://localhost:5000/api

# Environment-specific files:
# .env.development - Uses localhost (auto-loaded in dev mode)
# .env.production - Uses server IP/domain (auto-loaded in build)
```

### Environment Mode Switching

Vite automatically loads the correct `.env` file:

- `npm run dev` → Uses `.env.development` (localhost)
- `npm run build` → Uses `.env.production` (server IP)
- `npm run preview` → Uses production build with production env

See `frontend/ENVIRONMENT.md` for advanced configuration.

## Common Gotchas

1. **isApproved field**: Students auto-approve on registration (`User.js:30-33`), companies require admin approval. Always check in company routes.

2. **Application uniqueness**: Compound index `{internship: 1, student: 1}` prevents duplicate applications. Handle duplicate key errors gracefully.

3. **Password field**: `User.password` has `select: false`. Must explicitly `.select('+password')` when comparing hashes (see `authController.js`).

4. **Zustand persist hydration**: Frontend `authStore` may not be immediately hydrated on first render. Use `useAuthStore.persist.hasHydrated()` if needed.

5. **File paths in responses**: Resume/logo paths are relative (`uploads/file.pdf`). Serve via Express static middleware at `/uploads` (see `app.js:35`).

6. **ES modules**: Backend uses `"type": "module"` in `package.json`. Always use `import/export` syntax, never `require()`. Use `fileURLToPath` for `__dirname` equivalents.

7. **CORS configuration**: Backend CORS allows credentials (`credentials: true` in `app.js:22-30`). Frontend must send `withCredentials: true` (already configured in `apiClient.js`).

8. **MongoDB container**: Docker MongoDB exposes on port 27017. Connection string in Docker Compose uses service name `mongodb://mongodb:27017` internally, but external tools connect via `localhost:27017`.

## Testing & Debugging

- **Backend logs**: Role checks and auth flow extensively logged with emoji prefixes (`✅`, `❌`, `🚫`)
- **Frontend logs**: `apiClient.js` logs all requests/responses with `console.log` (search for `📤`, `✅`, `❌`)
- **No test suite configured**: `package.json` scripts reference placeholder tests. Manual testing via API docs (`backend/API_DOCS.md`).

## Key Files for Context

- `backend/models/User.js` - Understand role discrimination and embedded vs referenced data
- `backend/middleware/auth.js` + `roleGuard.js` - Authentication/authorization patterns
- `frontend/src/lib/apiClient.js` - Axios interceptors and token refresh logic
- `frontend/src/App.jsx` - Route structure and role-based navigation
- `backend/API_DOCS.md` - Complete endpoint reference with request/response examples
- `DOCKER.md` - Complete Docker setup, deployment, and troubleshooting guide
- `docker-compose.yml` - Multi-container orchestration with MongoDB, backend, and frontend
