# SkillSync - Internship Matching Platform 🎓💼

A comprehensive full-stack web application that intelligently connects students with internship opportunities. Features a multi-role system (Students, Companies, Admins), AI-powered recommendations, and real-time application tracking.

**Built with:** Node.js, Express, MongoDB, React 18, Vite, TailwindCSS, and JWT Authentication

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone and configure**

   ```pwsh
   git clone https://github.com/saketh-exe/ice-candy.git
   cd ice-candy
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start all services**

   ```pwsh
   docker-compose up -d --build
   ```

3. **Create admin user**

   ```pwsh
   docker-compose exec backend node scripts/createAdmin.js
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

See [DOCKER.md](./DOCKER.md) for detailed Docker documentation.

### Local Development

See individual setup guides:

- **Backend**: [backend/QUICK_START.md](./backend/QUICK_START.md)
- **Frontend**: [frontend/README.md](./frontend/README.md)

## 📁 Project Structure

```
iceCandy/
├── backend/                      # Node.js/Express API Server
│   ├── config/
│   │   └── db.js                # MongoDB connection setup
│   ├── controllers/              # Business logic handlers
│   │   ├── adminController.js   # Admin operations (user/internship management)
│   │   ├── authController.js    # Auth operations (register, login, refresh)
│   │   ├── companyController.js # Company operations (profile, internships)
│   │   ├── internshipController.js # Public internship browsing
│   │   ├── recommendationController.js # AI-powered recommendations
│   │   └── studentController.js # Student operations (profile, applications)
│   ├── middleware/               # Express middleware
│   │   ├── auth.js              # JWT verification (protect, optionalAuth)
│   │   ├── errorHandler.js      # Global error handler + ApiError class
│   │   ├── roleGuard.js         # Role-based access control (authorize)
│   │   ├── upload.js            # Multer config (resumeFilter, fileFilter)
│   │   └── validator.js         # Joi validation middleware + schemas
│   ├── models/                   # Mongoose schemas
│   │   ├── Application.js       # Application model with status history
│   │   ├── Company.js           # Company profile model
│   │   ├── Internship.js        # Internship listing model
│   │   └── User.js              # User model (multi-role with embedded profiles)
│   ├── routes/                   # Express route definitions
│   │   ├── adminRoutes.js       # /api/admin/* endpoints
│   │   ├── authRoutes.js        # /api/auth/* endpoints
│   │   ├── companyRoutes.js     # /api/company/* endpoints
│   │   ├── internshipRoutes.js  # /api/internships/* endpoints
│   │   └── studentRoutes.js     # /api/student/* endpoints
│   ├── scripts/
│   │   ├── createAdmin.js       # CLI script to create admin user
│   │   └── README.md            # Script documentation
│   ├── services/
│   │   └── ragService.js        # RAG recommendation service (placeholder)
│   ├── utils/                    # Helper utilities
│   │   ├── apiResponse.js       # Response formatters (success/error)
│   │   ├── generateToken.js     # JWT token generation/verification
│   │   └── matchingAlgorithm.js # Applicant scoring algorithm
│   ├── uploads/                  # File upload directory (gitignored)
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── Dockerfile                # Backend container config
│   ├── package.json              # Backend dependencies
│   ├── .env.example              # Environment variables template
│   ├── API_DOCS.md               # Complete API documentation
│   ├── MATCHING_ALGORITHM.md     # Matching algorithm details
│   └── RECOMMENDATIONS_API.md    # Recommendations endpoint docs
│
├── frontend/                     # React/Vite Client Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable UI components
│   │   │   │   ├── Badge.jsx    # Status badges
│   │   │   │   ├── Button.jsx   # Button component (with variants)
│   │   │   │   ├── Card.jsx     # Card container
│   │   │   │   ├── Input.jsx    # Form input
│   │   │   │   ├── Modal.jsx    # Modal dialog
│   │   │   │   ├── Navbar.jsx   # Navigation bar
│   │   │   │   ├── Notification.jsx # Toast notifications
│   │   │   │   ├── Select.jsx   # Select dropdown
│   │   │   │   ├── Sidebar.jsx  # Sidebar navigation
│   │   │   │   ├── Spinner.jsx  # Loading spinner
│   │   │   │   ├── Table.jsx    # Data table
│   │   │   │   └── ThemeToggle.jsx # Dark/light mode toggle
│   │   │   ├── layouts/         # Role-based page layouts
│   │   │   │   ├── AdminLayout.jsx   # Admin dashboard layout
│   │   │   │   ├── CompanyLayout.jsx # Company dashboard layout
│   │   │   │   ├── PublicLayout.jsx  # Public pages layout
│   │   │   │   └── StudentLayout.jsx # Student dashboard layout
│   │   │   └── routes/
│   │   │       └── ProtectedRoute.jsx # Auth + role guard wrapper
│   │   ├── pages/                # Page components
│   │   │   ├── admin/           # Admin pages (Dashboard, Users, etc.)
│   │   │   ├── auth/            # Auth pages (Login, Register, Unauthorized)
│   │   │   ├── company/         # Company pages (Profile, Internships, Applications, etc.)
│   │   │   ├── student/         # Student pages (Browse, Apply, MyApplications, etc.)
│   │   │   ├── Home.jsx         # Landing page
│   │   │   └── NotFound.jsx     # 404 page
│   │   ├── services/            # API service layer
│   │   │   ├── adminService.js  # Admin API calls
│   │   │   ├── authService.js   # Auth API calls
│   │   │   ├── companyService.js # Company API calls
│   │   │   ├── internshipService.js # Public internship API calls
│   │   │   └── studentService.js # Student API calls
│   │   ├── store/               # Zustand state management
│   │   │   ├── authStore.js     # Auth state (persisted to localStorage)
│   │   │   └── uiStore.js       # UI state (notifications, modals, theme)
│   │   ├── lib/
│   │   │   ├── apiClient.js     # Axios instance with interceptors
│   │   │   └── utils.js         # Utility functions (cn, formatters, etc.)
│   │   ├── App.jsx              # Root component with routing
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles + Tailwind imports
│   ├── public/                   # Static assets
│   ├── Dockerfile                # Frontend container config (Nginx)
│   ├── nginx.conf                # Nginx configuration for production
│   ├── vite.config.js            # Vite build configuration
│   ├── tailwind.config.js        # TailwindCSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── package.json              # Frontend dependencies
│   ├── .env.development          # Development environment vars
│   ├── .env.production           # Production environment vars
│   ├── ENVIRONMENT.md            # Environment setup guide
│   └── ENV_QUICK_REF.md          # Environment quick reference
│
├── scripts/                      # Additional utility scripts
├── docker-compose.yml            # Multi-container orchestration
├── .env.example                  # Root environment template
├── DOCKER.md                     # Docker documentation
├── DEPLOYMENT_CHECKLIST.md       # Deployment guide
├── README.md                     # This file
└── .github/
    └── copilot-instructions.md   # AI agent instructions
```

## 🎯 Features

### For Students
- 🔍 **Browse Internships** - Search and filter internships by location, type, skills, and duration
- 📝 **Easy Applications** - Apply with cover letters and custom question responses
- 📊 **Application Tracking** - Monitor application status in real-time (pending, reviewed, shortlisted, rejected, accepted)
- 📄 **Resume Management** - Upload and manage resumes (PDF format)
- 👤 **Profile Management** - Complete profile with education, skills, interests, and contact info
- ⭐ **Skill Matching** - Get matched with relevant internships based on your skills

### For Companies
- 📢 **Post Internships** - Create detailed internship listings with requirements, skills, and custom screening questions
- 📥 **Manage Applications** - View, review, and update application statuses
- 🤖 **AI Recommendations** - Get intelligent applicant recommendations based on skills and profile matching
- 🎯 **Smart Matching** - Text-based matching algorithm scores applicants (0-100) across multiple factors
- 🏢 **Company Profile** - Showcase company details, logo, industry, and location
- 📈 **Analytics Dashboard** - Track internship performance and application metrics

### For Admins
- 👥 **User Management** - Approve/reject company registrations, activate/deactivate accounts
- 📋 **Internship Oversight** - Monitor all internships and applications across the platform
- 🛡️ **Access Control** - Role-based permissions for secure operations
- 📊 **Platform Analytics** - View comprehensive statistics and user activity

### Technical Features
- 🔐 **Secure Authentication** - JWT-based auth with access (15m) and refresh (7d) tokens
- 🔄 **Auto Token Refresh** - Seamless token renewal on expiration
- 📁 **File Uploads** - Multer-powered resume and logo uploads with validation
- ✅ **Input Validation** - Joi schemas with comprehensive error handling
- 🎨 **Responsive Design** - Modern UI with TailwindCSS and dark mode support
- 🚀 **Docker Ready** - Complete containerization with Docker Compose
- 📱 **Mobile Friendly** - Fully responsive across all devices

## 🛠️ Tech Stack

### Backend (Node.js + Express)

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js 20 LTS (ES Modules) |
| **Framework** | Express.js 4.19 |
| **Database** | MongoDB 7 with Mongoose 8.3 |
| **Authentication** | JWT (jsonwebtoken 9.0) + bcryptjs 2.4 |
| **Validation** | Joi 17.13 |
| **File Upload** | Multer 2.0 |
| **HTTP Logger** | Morgan 1.10 |
| **Environment** | dotenv 16.4 |
| **CORS** | cors 2.8 |
| **Dev Tools** | nodemon 3.1 |

#### Backend Architecture
- **MVC Pattern** - Models, Controllers, Routes separation
- **Middleware Chain** - Auth → Role Guard → Validation → Controller
- **Error Handling** - Global error handler with custom ApiError class
- **API Responses** - Standardized `successResponse()` and `errorResponse()` helpers
- **Async Wrapper** - `asyncHandler` for clean async/await error handling
- **Mongoose Hooks** - Post-save hooks for automatic data updates

### Frontend (React + Vite)

| Category | Technologies |
|----------|-------------|
| **Library** | React 18.2 |
| **Build Tool** | Vite 5.0 |
| **Routing** | React Router v6.20 |
| **State Management** | Zustand 4.4 (with persist middleware) |
| **HTTP Client** | Axios 1.6 (with interceptors) |
| **Form Handling** | React Hook Form 7.48 |
| **Validation** | Zod 3.22 + @hookform/resolvers 3.3 |
| **Styling** | TailwindCSS 3.3 + PostCSS + Autoprefixer |
| **Icons** | Lucide React 0.294 |
| **Utilities** | clsx 2.0, tailwind-merge 2.1, class-variance-authority 0.7 |
| **Dev Tools** | ESLint 8.55, Vite HMR |

#### Frontend Architecture
- **Component-Based** - Reusable common components (shadcn/ui patterns)
- **Role-Based Layouts** - Separate layouts for Student, Company, Admin
- **Service Layer** - Dedicated API services for each role
- **Protected Routes** - Route guards with role checking
- **Persistent Auth** - Zustand persist to localStorage (`auth-storage` key)
- **Auto Token Refresh** - Axios interceptors handle 401 responses
- **Theme Support** - Dark/Light mode toggle with system preference

### DevOps & Infrastructure

| Category | Technologies |
|----------|-------------|
| **Containerization** | Docker + Docker Compose |
| **Web Server** | Nginx (production frontend) |
| **Database** | MongoDB 7 (Docker container) |
| **Environment Management** | Multi-stage .env files (dev/prod) |
| **Health Checks** | Docker health checks for all services |
| **Logging** | Morgan (backend) + Console logs with emoji prefixes |

### File Upload System

- **Storage**: Local file system (`backend/uploads/` directory)
- **File Types**: 
  - Resumes: PDF only (via `resumeFilter`)
  - Logos: PDF, DOC, DOCX, JPEG, JPG, PNG (via `fileFilter`)
- **Naming**: `{filename}-{timestamp}-{userId}.{ext}`
- **Access**: 
  - Static route: `/uploads/:filename`
  - Streaming endpoint: `/api/files/:filename` (with range support)
- **Validation**: File type and size limits enforced by Multer

### Validation System

#### Backend (Joi Schemas)
- `registerSchema` - User registration with role-specific fields
- `loginSchema` - Email and password validation
- `internshipSchema` - Complete internship creation validation
- `internshipUpdateSchema` - Partial update validation
- `companyProfileSchema` - Company profile updates
- `studentProfileSchema` - Student profile updates
- `applicationStatusSchema` - Application status updates
- **Features**: `abortEarly: false`, `stripUnknown: true`, detailed error messages

#### Frontend (Zod + React Hook Form)
- Form-level validation with zod resolvers
- Real-time validation feedback
- Controlled components with form state management

### AI/Matching Features

#### Text-Based Matching Algorithm
Located in `backend/utils/matchingAlgorithm.js`:
- **Skills Matching (50% weight)** - Exact and partial skill matching
- **Text Similarity (30% weight)** - Profile and internship description comparison
- **Education Match (20% weight)** - Major and university relevance
- **Output**: 0-100 match score with detailed breakdown

See [MATCHING_ALGORITHM.md](./backend/MATCHING_ALGORITHM.md) for implementation details.

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [API_DOCS.md](./backend/API_DOCS.md) | Complete REST API reference with request/response examples |
| [DOCKER.md](./DOCKER.md) | Docker setup, commands, scaling, and troubleshooting |
| [MATCHING_ALGORITHM.md](./backend/MATCHING_ALGORITHM.md) | Detailed explanation of the matching algorithm |
| [RECOMMENDATIONS_API.md](./backend/RECOMMENDATIONS_API.md) | Recommendations endpoints documentation |
| [ENVIRONMENT.md](./frontend/ENVIRONMENT.md) | Frontend environment configuration guide |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Pre-deployment checklist and best practices |
| [copilot-instructions.md](./.github/copilot-instructions.md) | AI coding agent instructions |
| [backend/scripts/README.md](./backend/scripts/README.md) | Scripts documentation |

## 🔐 Default Credentials

After creating the admin user with `docker-compose exec backend node scripts/createAdmin.js`:

```
Email:    admin@skillsync.com
Password: Admin@123
```

⚠️ **IMPORTANT**: Change these credentials immediately after first login!

You can also set custom credentials via environment variables:
```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=YourSecurePassword123
```

## 📝 Environment Configuration

### Backend Configuration (`.env`)

Copy `.env.example` to `.env` and configure:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/skillsync
MONGO_ROOT_USERNAME=admin              # Required for Docker
MONGO_ROOT_PASSWORD=secure_password    # Required for Docker
MONGO_DB_NAME=skillsync

# JWT Configuration (⚠️ CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRE=15m                         # Access token expiry
JWT_REFRESH_EXPIRE=7d                  # Refresh token expiry

# Server Configuration
PORT=5000
NODE_ENV=development                   # 'development' or 'production'

# CORS Configuration
CORS_ORIGIN=http://localhost:3000      # Frontend URL

# Admin Account (for scripts/createAdmin.js)
ADMIN_EMAIL=admin@skillsync.com
ADMIN_PASSWORD=Admin@123
```

### Frontend Configuration (`.env`)

Frontend uses multiple environment files that Vite loads automatically:

**`.env.development`** (used during `npm run dev`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**`.env.production`** (used during `npm run build`):
```env
VITE_API_BASE_URL=https://your-production-api.com/api
# or: VITE_API_BASE_URL=http://65.0.18.1:5000/api
```

**Environment Loading Rules:**
- `npm run dev` → Loads `.env.development`
- `npm run build` → Loads `.env.production`
- `npm run preview` → Uses production build (`.env.production`)

See [frontend/ENVIRONMENT.md](./frontend/ENVIRONMENT.md) for advanced configuration.

### Docker Environment Variables

When using Docker Compose, all environment variables are loaded from the root `.env` file.

**Key Variables for Docker:**
- `MONGO_ROOT_USERNAME` - MongoDB admin username
- `MONGO_ROOT_PASSWORD` - MongoDB admin password
- `JWT_SECRET` - Must be at least 32 characters
- `JWT_REFRESH_SECRET` - Must be at least 32 characters
- `CORS_ORIGIN` - Frontend URL for CORS
- `VITE_API_BASE_URL` - Backend API URL for frontend

## 🐳 Docker Commands

### Essential Commands

```pwsh
# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# Start with rebuild (after code changes)
docker-compose up -d --build

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ Deletes all data!)
docker-compose down -v

# Check service status
docker-compose ps

# Restart a specific service
docker-compose restart backend

# Execute commands in a running container
docker-compose exec backend node scripts/createAdmin.js
docker-compose exec backend npm install
docker-compose exec mongodb mongosh

# View container resource usage
docker stats
```

### Troubleshooting Commands

```pwsh
# View backend logs with timestamps
docker-compose logs -f --timestamps backend

# Inspect a service
docker-compose exec backend node --version
docker-compose exec backend npm list

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p secure_password

# Remove all containers and images (clean slate)
docker-compose down --rmi all --volumes --remove-orphans

# Rebuild a specific service
docker-compose build backend
docker-compose up -d backend
```

See [DOCKER.md](./DOCKER.md) for complete Docker documentation including health checks, scaling, and deployment.

## 🧪 API Testing

### Health Check

```bash
# Backend health endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-12T10:30:00.000Z"}
```

### Testing Tools

1. **Postman** - Import the API collection
2. **Thunder Client** (VS Code extension)
3. **curl** - Command-line testing
4. **Insomnia** - API design and testing

### Sample API Calls

```bash
# Register a student
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Test@123",
    "role": "student",
    "name": "John Doe",
    "university": "MIT"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Test@123"
  }'

# Get internships (with auth token)
curl http://localhost:5000/api/internships \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### API Documentation

See [backend/API_DOCS.md](./backend/API_DOCS.md) for:
- Complete endpoint reference
- Request/response examples
- Authentication requirements
- Error codes and messages
- Pagination and filtering

## 🏗️ Architecture Highlights

### Authentication Flow

```
1. User Login → POST /api/auth/login
2. Backend validates credentials
3. Returns: { user, accessToken (15m), refreshToken (7d) }
4. Frontend stores in Zustand (persisted to localStorage)
5. Axios interceptor adds token to all requests
6. On 401 (token expired) → Auto-refresh with refreshToken
7. New accessToken → Update store → Retry original request
```

### Application Workflow

```
Student Side:
1. Browse internships → GET /api/internships
2. View details → GET /api/internships/:id
3. Apply → POST /api/student/apply/:internshipId
4. Track status → GET /api/student/applications

Company Side:
1. Post internship → POST /api/company/internships
2. View applicants → GET /api/company/internships/:id/applicants
3. Get recommendations → GET /api/company/recommendations/:internshipId
4. Update status → PUT /api/company/applications/:id/status

Automatic:
- Application count updates via Mongoose post-save hook
- Status history tracking with timestamps
```

### Role-Based Access Control (RBAC)

```javascript
// Middleware chain: protect → authorize → validate → controller
router.use(protect);                           // JWT verification
router.use(authorize('company'));              // Role check
router.post('/internships', 
  validate(internshipSchema),                  // Input validation
  createInternship                             // Controller
);
```

### Data Models Relationship

```
User (role: student/company/admin)
├── studentProfile (embedded)
│   ├── education []
│   ├── skills []
│   └── resume {filename, path}
└── company → Company (reference)
    ├── logo {filename, path}
    └── location {city, state, country}

Internship
├── company → Company
├── postedBy → User
└── applicationsCount (auto-updated)

Application
├── student → User
├── company → Company
├── internship → Internship
├── statusHistory []
└── answers [{question, answer}]
```

### State Management (Frontend)

```javascript
// Zustand stores
authStore = {
  user,              // User object with role
  accessToken,       // JWT access token (15m)
  refreshToken,      // JWT refresh token (7d)
  isAuthenticated,   // Boolean
  setAuth(),         // Update auth state
  logout()           // Clear auth state
}
// Persisted to localStorage as 'auth-storage'

uiStore = {
  theme,             // 'light' | 'dark'
  notifications [],  // Toast notifications
  modals {},         // Modal states
  showNotification(),
  toggleTheme()
}
```

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth with RS256 algorithm
- ✅ **Password Hashing** - bcryptjs with salt rounds (passwords never stored in plain text)
- ✅ **CORS Configuration** - Restricted origins with credentials support
- ✅ **Input Validation** - Joi schemas validate all inputs before processing
- ✅ **SQL Injection Protection** - Mongoose ODM with parameterized queries
- ✅ **XSS Protection** - Input sanitization and output encoding
- ✅ **Role-Based Access** - Middleware enforces role permissions on routes
- ✅ **Token Expiry** - Short-lived access tokens (15m) with refresh mechanism
- ✅ **File Upload Validation** - Type and size restrictions enforced
- ✅ **Error Handling** - Sensitive info hidden in production mode

## 🚀 Performance Optimizations

- ⚡ **Vite Build Tool** - Lightning-fast HMR and optimized production builds
- ⚡ **Mongoose Indexes** - Compound indexes on frequent queries
- ⚡ **Lazy Loading** - React Router lazy imports for code splitting
- ⚡ **File Streaming** - Range support for large file downloads
- ⚡ **Connection Pooling** - MongoDB connection pool management
- ⚡ **Static Asset Caching** - Nginx caching for frontend assets
- ⚡ **Docker Multi-Stage Builds** - Optimized image sizes

## 📊 Database Schema

### Collections

1. **users** - All users (students, companies, admins)
   - Indexes: `email` (unique), `role`
   - Embedded: `studentProfile` for students
   - Reference: `company` ObjectId for companies

2. **companies** - Company profiles
   - Indexes: `user` (unique)
   - Fields: logo, location, industry, contact info

3. **internships** - Internship listings
   - Indexes: `company`, `postedBy`, `location`, `skills`
   - Auto-updated: `applicationsCount`

4. **applications** - Internship applications
   - Indexes: Compound `{internship, student}` (unique), `{student, status}`, `{company, status}`
   - Embedded: `statusHistory`, `answers`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Saketh** - [saketh-exe](https://github.com/saketh-exe)

## 🙏 Acknowledgments

- Built as a learning project for full-stack development
- Inspired by internship matching platforms like Internshala and LinkedIn

---

For detailed setup instructions, troubleshooting, and deployment guides, see the documentation files listed above.
