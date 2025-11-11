# SkillSync API Documentation

## Base URL

```
http://localhost:5000
```

---

## 🔐 Authentication Routes (`/api/auth`)

### 1. Register User

**POST** `/api/auth/register`

**Body:**

```json
{
  "email": "student@example.com",
  "password": "Pass123!",
  "role": "student"
}
```

**Role:** `student` or `company` (admin cannot register via API)

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {...},
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### 2. Login

**POST** `/api/auth/login`

**Body:**

```json
{
  "email": "student@example.com",
  "password": "Pass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### 3. Refresh Token

**POST** `/api/auth/refresh`

**Body:**

```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGci..."
  }
}
```

---

### 4. Get Current User (Protected)

**GET** `/api/auth/me`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Response:**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {...}
  }
}
```

---

### 5. Logout (Protected)

**POST** `/api/auth/logout`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 6. Update Password (Protected)

**PUT** `/api/auth/password`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Body:**

```json
{
  "currentPassword": "Pass123!",
  "newPassword": "NewPass456!"
}
```

---

## 👨‍🎓 Student Routes (`/api/student`) - Protected (Student Role)

### 1. Get Profile

**GET** `/api/student/profile`

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

### 2. Update Profile

**PUT** `/api/student/profile`

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "bio": "CS student passionate about web dev",
  "skills": ["JavaScript", "React", "Node.js"],
  "interests": ["Web Development", "AI"],
  "education": [
    {
      "institution": "MIT",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "startDate": "2021-09-01",
      "endDate": "2025-06-01",
      "cgpa": 3.8,
      "current": true
    }
  ],
  "location": {
    "city": "Boston",
    "state": "MA",
    "country": "USA"
  }
}
```

---

### 3. Upload Resume

**POST** `/api/student/resume`

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Body (Form Data):**

```
Key: resume
Value: [Select PDF file]
```

**Postman:**

- Select Body → form-data
- Key: `resume`, Type: File
- Choose your PDF file

---

### 4. Get All Internships

**GET** `/api/student/internships?page=1&limit=10&search=software&locationType=remote&isPaid=true`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Query Params (Optional):**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `locationType` - onsite, remote, hybrid
- `isPaid` - true, false

---

### 5. Get Internship Details

**GET** `/api/student/internships/:id`

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

### 6. Apply for Internship

**POST** `/api/student/apply/:internshipId`

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body:**

```json
{
  "coverLetter": "I am excited to apply for this position...",
  "answers": [
    {
      "question": "Why do you want to join?",
      "answer": "I admire your company's innovation..."
    }
  ]
}
```

---

### 7. Get My Applications

**GET** `/api/student/applications?status=pending&page=1&limit=10`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Query Params (Optional):**

- `status` - pending, reviewed, shortlisted, rejected, accepted, withdrawn
- `page` - Page number
- `limit` - Items per page

---

### 8. Get Application Details

**GET** `/api/student/applications/:id`

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

### 9. Withdraw Application

**DELETE** `/api/student/applications/:id`

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

## 🏢 Company Routes (`/api/company`) - Protected (Company Role)

### 1. Get Company Profile

**GET** `/api/company/profile`

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

### 2. Update Company Profile

**PUT** `/api/company/profile`

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body:**

```json
{
  "companyName": "TechCorp Inc.",
  "industry": "Technology",
  "companySize": "51-200",
  "description": "Leading tech company...",
  "website": "https://techcorp.com",
  "founded": 2015,
  "location": {
    "address": "123 Tech St",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "zipCode": "94102"
  },
  "contactInfo": {
    "phone": "+1-555-0123",
    "email": "hr@techcorp.com",
    "linkedin": "https://linkedin.com/company/techcorp"
  }
}
```

---

### 3. Create Internship

**POST** `/api/company/internships`

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body:**

```json
{
  "title": "Full Stack Development Intern",
  "description": "We are looking for a talented developer...",
  "requirements": "- Strong JavaScript knowledge\n- React experience",
  "responsibilities": "- Develop features\n- Write tests",
  "skills": ["JavaScript", "React", "Node.js"],
  "location": "San Francisco, CA",
  "locationType": "hybrid",
  "duration": {
    "value": 3,
    "type": "months"
  },
  "stipend": {
    "amount": 2500,
    "currency": "USD",
    "period": "monthly"
  },
  "isPaid": true,
  "positions": 2,
  "applicationDeadline": "2024-12-31T23:59:59.000Z",
  "startDate": "2025-01-15T00:00:00.000Z",
  "status": "active"
}
```

---

### 4. Get Company's Internships

**GET** `/api/company/internships?status=active&page=1&limit=10`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Query Params (Optional):**

- `status` - draft, active, closed, filled
- `page` - Page number
- `limit` - Items per page

---

### 5. Get Single Internship

**GET** `/api/company/internships/:id`

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

### 6. Update Internship

**PUT** `/api/company/internships/:id`

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body:** (Same as Create, all fields optional)

```json
{
  "title": "Updated Title",
  "status": "closed"
}
```

---

### 7. Delete Internship

**DELETE** `/api/company/internships/:id`

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

### 8. Get Applicants for Internship

**GET** `/api/company/internships/:id/applicants?status=pending&page=1&limit=20`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Query Params (Optional):**

- `status` - pending, reviewed, shortlisted, rejected, accepted
- `page` - Page number
- `limit` - Items per page

---

### 9. Get All Applications

**GET** `/api/company/applications?status=shortlisted&page=1&limit=20`

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

### 10. Update Application Status

**PUT** `/api/company/applications/:id/status`

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body:**

```json
{
  "status": "shortlisted",
  "note": "Strong candidate, invited for interview"
}
```

**Valid Status Values:**

- `reviewed`
- `shortlisted`
- `rejected`
- `accepted`

---

## 👨‍💼 Admin Routes (`/api/admin`) - Protected (Admin Role)

### 1. Get All Users

**GET** `/api/admin/users?role=company&isApproved=false&page=1&limit=20`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Query Params (Optional):**

- `role` - student, company, admin
- `isActive` - true, false
- `isApproved` - true, false
- `search` - Search by email
- `page` - Page number
- `limit` - Items per page

---

### 2. Get User by ID

**GET** `/api/admin/users/:id`

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

### 3. Update User Status

**PUT** `/api/admin/users/:id/status`

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body:**

```json
{
  "isActive": true,
  "isApproved": true
}
```

---

### 4. Delete User

**DELETE** `/api/admin/users/:id`

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

### 5. Get All Internships

**GET** `/api/admin/internships?status=active&page=1&limit=20`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Query Params (Optional):**

- `status` - draft, active, closed, filled
- `isActive` - true, false
- `search` - Search term
- `page` - Page number
- `limit` - Items per page

---

### 6. Delete Internship

**DELETE** `/api/admin/internships/:id`

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

### 7. Get All Applications

**GET** `/api/admin/applications?status=pending&page=1&limit=20`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Query Params (Optional):**

- `status` - pending, reviewed, shortlisted, rejected, accepted
- `page` - Page number
- `limit` - Items per page

---

### 8. Verify Company

**PUT** `/api/admin/companies/:id/verify`

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body:**

```json
{
  "verified": true
}
```

---

### 9. Get Platform Statistics

**GET** `/api/admin/stats`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Response:**

```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "stats": {
      "users": {
        "total": 1250,
        "students": 980,
        "companies": 268,
        "active": 1180,
        "pendingApprovals": 12,
        "recentRegistrations": 45
      },
      "internships": {
        "total": 342,
        "active": 156,
        "recentlyPosted": 23
      },
      "applications": {
        "total": 4521,
        "pending": 234,
        "shortlisted": 456,
        "recentSubmissions": 189
      }
    }
  }
}
```

---

## 🌐 Public Internship Routes (`/api/internships`)

### 1. Get All Public Internships

**GET** `/api/internships?page=1&limit=10&locationType=remote&isPaid=true&skills=JavaScript,React`

**Query Params (Optional):**

- `page` - Page number
- `limit` - Items per page
- `search` - Search term
- `locationType` - onsite, remote, hybrid
- `isPaid` - true, false
- `skills` - Comma-separated skills

---

### 2. Get Public Internship Details

**GET** `/api/internships/:id`

---

## 🔧 Postman Setup

### Setting Up Environment Variables in Postman:

1. Create Environment (e.g., "SkillSync Local")
2. Add Variables:
   - `baseUrl` = `http://localhost:5000`
   - `accessToken` = (will be set after login)
   - `refreshToken` = (will be set after login)

### Auto-save Token After Login:

In the **Tests** tab of your login request, add:

```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("accessToken", response.data.accessToken);
  pm.environment.set("refreshToken", response.data.refreshToken);
}
```

### Using Token in Requests:

In **Authorization** tab:

- Type: Bearer Token
- Token: `{{accessToken}}`

Or in **Headers**:

- Key: `Authorization`
- Value: `Bearer {{accessToken}}`

---

## 📊 Common Error Responses

### 400 - Validation Error

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": ["Email is required", "Password must be at least 6 characters"]
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### 403 - Forbidden

```json
{
  "success": false,
  "message": "User role 'student' is not authorized to access this route"
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 - Server Error

```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## 🚀 Quick Test Flow

1. **Register Student:**

   - POST `/api/auth/register` with student credentials

2. **Login:**

   - POST `/api/auth/login` → Save accessToken

3. **Update Profile:**

   - PUT `/api/student/profile` with Authorization header

4. **Upload Resume:**

   - POST `/api/student/resume` (form-data with PDF)

5. **Browse Internships:**

   - GET `/api/student/internships`

6. **Apply:**
   - POST `/api/student/apply/:internshipId`

---

## 📝 Notes

- All protected routes require `Authorization: Bearer <token>` header
- Tokens expire (7 days for access, 30 days for refresh by default)
- File uploads use `multipart/form-data`
- All other requests use `application/json`
- Pagination default: page=1, limit=10/20
- **Admin users must be created using the setup script: `node scripts/createAdmin.js`**

---

## 👨‍💼 Creating Admin User

Admin users cannot register via API for security reasons. Use the setup script:

### Quick Setup

```bash
# From backend directory
node scripts/createAdmin.js
```

**Default credentials:**

- Email: `admin@skillsync.com`
- Password: `Admin@123`

**⚠️ Change password after first login!**

### Custom Credentials

```bash
# Set environment variables (Windows)
set ADMIN_EMAIL=youradmin@example.com
set ADMIN_PASSWORD=YourSecurePass123!
node scripts/createAdmin.js

# Or add to .env temporarily
ADMIN_EMAIL=youradmin@example.com
ADMIN_PASSWORD=YourSecurePass123!
```

For more details, see `scripts/README.md`

---

**Total Endpoints:** 40+
**Authentication:** JWT (Access + Refresh Tokens)
**File Upload:** Multer (PDF for resumes, max 5MB)
