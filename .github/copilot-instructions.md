# SkillSync - AI Coding Agent Instructions

## Architecture Overview

**SkillSync** is a full-stack internship matching platform with a Node.js/Express backend and React/Vite frontend. The system supports three distinct user roles: **student**, **company**, and **admin**, each with isolated feature sets and UI layouts.

### Key Architectural Decisions

- **Multi-role single User model**: All users (students, companies, admins) share the `User` model with role-specific embedded fields (`studentProfile`) and references (`company` ObjectId). Companies auto-create a linked `Company` document.
- **JWT-based auth with refresh tokens**: Backend uses dual-token system (access + refresh). Frontend stores both in Zustand persist (localStorage) under `auth-storage`.
- **Mongoose post-save hooks**: `Application` model automatically updates `Internship.applicationsCount` on save/remove (see `backend/models/Application.js:67-82`).
- **Standardized API responses**: All endpoints use `successResponse()` and `errorResponse()` helpers from `backend/utils/apiResponse.js` with consistent `{success, message, data}` structure.

## Critical Developer Workflows

### Option 1: Docker Setup (Recommended for Production)

```pwsh
# Copy and configure environment variables
cp .env.example .env  # Edit with your secrets

# Build and start all services (MongoDB, Backend, Frontend)
docker-compose up -d --build

# Create admin user
docker-compose exec backend node scripts/createAdmin.js

# Access: Frontend at http://localhost:3000, Backend at http://localhost:5000
```

See `DOCKER.md` for complete Docker documentation, health checks, scaling, and troubleshooting.

### Option 2: Local Development Setup

#### Backend Setup

```pwsh
cd backend
npm install
cp .env.example .env  # Configure MONGO_URI, JWT_SECRET, PORT
npm run dev           # Starts nodemon on port 5000
```

#### Frontend Setup

```pwsh
cd frontend
npm install
# Create .env with: VITE_API_BASE_URL=http://localhost:5000/api
npm run dev           # Vite dev server on port 5173
```

#### Create Admin User (Required First Step)

```pwsh
cd backend
node scripts/createAdmin.js  # Default: admin@skillsync.com / Admin@123
```

## Project-Specific Conventions

### Backend Patterns

1. **Route Protection Chain**: Always use `protect` middleware (JWT verification) → `authorize(...roles)` middleware (role checking)

   ```javascript
   // Example: backend/routes/companyRoutes.js
   router.post("/internships", protect, authorize("company"), postInternship);
   ```

2. **Model Population Strategy**: Controllers populate refs on read operations, not model defaults

   ```javascript
   // backend/controllers/internshipController.js pattern
   const internships = await Internship.find().populate(
     "company",
     "companyName logo"
   );
   ```

3. **File Upload Handling**: Uses Multer middleware (`backend/middleware/upload.js`) with `uploads/` directory for resumes/logos. Files stored as `{filename, path, uploadedAt}` objects in models.

4. **Validation Approach**: Joi schemas in `backend/middleware/validator.js` validate request bodies before controller execution.

### Frontend Patterns

1. **Zustand State Management**:

   - `authStore.js`: User auth state (persisted to localStorage as `auth-storage`)
   - `uiStore.js`: UI state (notifications, modals)
   - Access token injected via axios interceptors in `apiClient.js:44-52`

2. **Service Layer Organization**: Each role has dedicated service file (`authService.js`, `studentService.js`, etc.) that wraps `apiClient` calls. Always use services, never raw axios.

3. **Route Structure by Role**:

   - `/student/*` → `StudentLayout` → requires `student` role
   - `/company/*` → `CompanyLayout` → requires `company` role
   - `/admin/*` → `AdminLayout` → requires `admin` role
   - Enforced by `ProtectedRoute` wrapper checking `useAuthStore().user.role`

4. **Component Library**: Custom components in `frontend/src/components/common/` follow shadcn/ui patterns with class-variance-authority for variants. Use these instead of creating new primitives.

## Data Flow & Integration Points

### Authentication Flow

1. Login: `POST /api/auth/login` → Returns `{user, accessToken, refreshToken}`
2. Frontend: `authService.login()` → `authStore.setAuth()` → Tokens persisted to localStorage
3. Subsequent requests: `apiClient` interceptor adds `Authorization: Bearer ${token}` header
4. Token expiry (401): `apiClient` interceptor auto-calls `POST /api/auth/refresh` with `refreshToken` → Updates `authStore`

### Application Submission Flow

1. Student applies: `POST /api/student/apply/:internshipId` with `{coverLetter, answers}`
2. `Application` created with `student`, `company`, `internship` refs and `status: 'pending'`
3. Mongoose post-save hook updates `Internship.applicationsCount` (automatic, no manual update needed)
4. Company views: `GET /api/company/applications` filtered by their `company` ObjectId
5. Status update: `PUT /api/company/applications/:id/status` → Appends to `statusHistory` array

### Cross-Component Data Requirements

- **Internship details pages** need: `Internship.populate('company', 'companyName logo location')` and `Internship.populate('postedBy', 'email')`
- **Application lists** need: `.populate('student', 'email studentProfile.name').populate('internship', 'title company')`
- **Company operations** require checking `req.user.company` ObjectId matches resource ownership (see `roleGuard.js:authorizeCompanyInternship`)

## Environment Variables & Configuration

### Backend `.env` (required)


### Frontend `.env` (required)

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Common Gotchas

1. **isApproved field**: Students auto-approve on registration (`User.js:30-33`), companies require admin approval. Always check in company routes.

2. **Application uniqueness**: Compound index `{internship: 1, student: 1}` prevents duplicate applications. Handle duplicate key errors gracefully.

3. **Password field**: `User.password` has `select: false`. Must explicitly `.select('+password')` when comparing hashes (see `authController.js`).

4. **Zustand persist hydration**: Frontend `authStore` may not be immediately hydrated on first render. Use `useAuthStore.persist.hasHydrated()` if needed.

5. **File paths in responses**: Resume/logo paths are relative (`uploads/file.pdf`). Serve via Express static middleware at `/uploads` (see `app.js:35`).

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
