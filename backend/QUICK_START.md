# SkillSync Backend - Quick Reference

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Server

```bash
npm start          # Production
npm run dev        # Development (with nodemon)
```

## 👨‍💼 Create Admin User

**Run the setup script:**

```bash
node scripts/createAdmin.js
```

**Default credentials:**

- Email: `admin@skillsync.com`
- Password: `Admin@123`

**⚠️ Change password after first login!**

**Custom credentials:**

```bash
# Windows
set ADMIN_EMAIL=youradmin@example.com
set ADMIN_PASSWORD=YourSecurePass123!
node scripts/createAdmin.js

# Linux/Mac
ADMIN_EMAIL=youradmin@example.com ADMIN_PASSWORD=YourSecurePass123! node scripts/createAdmin.js
```

## 📚 Documentation

- **API Documentation:** `API_DOCS.md`
- **Admin Scripts:** `scripts/README.md`
- **Project Overview:** `../PROJECT_SUMMARY.md`

## 🔗 Important Endpoints

### Authentication

- `POST /api/auth/register` - Register (student/company)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Change password

### Student

- `GET /api/student/profile` - Get profile
- `POST /api/student/resume` - Upload resume
- `GET /api/student/internships` - Browse internships
- `POST /api/student/apply/:id` - Apply for internship

### Company

- `POST /api/company/internships` - Post internship
- `GET /api/company/applications` - View applications
- `PUT /api/company/applications/:id/status` - Update status

### Admin

- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Approve/deactivate user
- `PUT /api/admin/companies/:id/verify` - Verify company
- `GET /api/admin/stats` - Platform statistics

## 📁 Project Structure

```
backend/
├── config/          # Database & server config
├── models/          # Mongoose models
├── controllers/     # Request handlers
├── routes/          # API routes
├── middleware/      # Auth, validation, error handling
├── utils/           # Helper functions
├── scripts/         # Admin setup scripts (gitignored)
├── uploads/         # File uploads
├── app.js          # Express app
└── package.json
```

## 🔐 Security Notes

- Admin cannot register via API
- Companies require admin approval (`isApproved`)
- JWT tokens: 7 days (access), 30 days (refresh)
- File uploads: PDF only, max 5MB
- All admin routes require admin role

## 🛠️ Environment Variables

Required in `.env`:

```env
MONGO_URI=mongodb://localhost:27017/skillsync
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5000
NODE_ENV=development
```

## 📊 Models

- **User** - Multi-role (student/company/admin)
- **Company** - Company profiles
- **Internship** - Job postings
- **Application** - Student applications

## 🎯 Quick Commands

```bash
# Start server
npm start

# Development mode
npm run dev

# Create admin
node scripts/createAdmin.js

# Check dependencies
npm list

# Update dependencies
npm update
```

## 🐛 Troubleshooting

**"Cannot connect to MongoDB"**

- Check if MongoDB is running
- Verify MONGO_URI in .env

**"Admin already exists"**

- Admin is already created
- Check database or delete existing admin first

**"JWT error"**

- Check JWT_SECRET in .env
- Ensure token is properly formatted

**"403 Forbidden"**

- Check user role matches route requirement
- For companies, check if `isApproved = true`

---

For detailed API documentation, see `API_DOCS.md`
