# SkillSync Frontend

React frontend for the SkillSync internship matching platform.

## Tech Stack

- **React 18.2** - UI library
- **Vite 5.0** - Build tool
- **TailwindCSS 3.3** - Styling
- **Zustand 4.4** - State management
- **React Router v6.20** - Routing
- **React Hook Form 7.48** - Form handling
- **Zod 3.22** - Validation
- **Axios 1.6** - HTTP client
- **Lucide React** - Icons

## Features

- 🔐 **Role-based Authentication** (Student, Company, Admin)
- 🎨 **Modern UI** with TailwindCSS and shadcn/ui design patterns
- 📱 **Responsive Design** for all screen sizes
- 🔄 **Automatic Token Refresh** with JWT
- 📊 **State Management** with Zustand
- ✅ **Form Validation** with React Hook Form + Zod
- 🎯 **Protected Routes** with role guards

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/       # Buttons, Cards, Inputs, etc.
│   │   ├── layouts/      # Page layouts for each role
│   │   └── routes/       # Protected route components
│   ├── pages/            # Page components
│   │   ├── auth/         # Login, Register
│   │   ├── student/      # Student module pages
│   │   ├── company/      # Company module pages
│   │   └── admin/        # Admin module pages
│   ├── services/         # API service modules
│   ├── store/            # Zustand stores
│   ├── lib/              # Utilities
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## Available Routes

### Public Routes

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page

### Student Routes (Protected)

- `/student/dashboard` - Student dashboard
- `/student/profile` - Student profile management
- `/student/internships` - Browse internships
- `/student/internships/:id` - Internship details
- `/student/applications` - My applications

### Company Routes (Protected)

- `/company/dashboard` - Company dashboard
- `/company/profile` - Company profile
- `/company/internships` - Manage internships
- `/company/internships/new` - Post new internship
- `/company/applications` - View applications

### Admin Routes (Protected)

- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/internships` - Internship management
- `/admin/applications` - Application management

## State Management

### Auth Store (`src/store/authStore.js`)

Manages user authentication state:

- `user` - Current user object
- `accessToken` - JWT access token
- `refreshToken` - JWT refresh token
- `isAuthenticated` - Auth status
- `setAuth()` - Set auth state
- `updateUser()` - Update user data
- `logout()` - Clear auth state
- `hasRole()` - Check user role

### UI Store (`src/store/uiStore.js`)

Manages UI state:

- `isLoading` - Global loading state
- `notification` - Notification messages
- `sidebarOpen` - Sidebar visibility
- `setLoading()` - Set loading state
- `showNotification()` - Display notification
- `toggleSidebar()` - Toggle sidebar

## API Integration

All API calls are made through service modules in `src/services/`:

- `authService.js` - Authentication endpoints
- `studentService.js` - Student operations
- `companyService.js` - Company operations
- `adminService.js` - Admin operations
- `internshipService.js` - Public internship listings

The `apiClient` (Axios instance) automatically:

- Adds JWT token to requests
- Handles token refresh on 401 errors
- Redirects to login on authentication failure

## Component Library

### Common Components

- `Button` - Customizable button with variants
- `Card` - Container with optional title
- `Input` - Form input with label and error
- `Select` - Dropdown select
- `Table` - Data table with headers
- `Badge` - Status badges
- `Modal` - Dialog/modal component
- `Spinner` - Loading spinner
- `Navbar` - Navigation bar
- `Sidebar` - Collapsible sidebar
- `Notification` - Toast notifications

## Styling

The project uses TailwindCSS with a custom theme supporting:

- CSS variables for theming
- Dark mode support (configured in `tailwind.config.js`)
- shadcn/ui compatible color system
- Responsive design utilities

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Backend Integration

Ensure the backend API is running on `http://localhost:5000` (or update `VITE_API_BASE_URL` in `.env`).

Refer to `backend/API_DOCS.md` for complete API documentation.

## Development Guidelines

1. **Import Paths**: Use `@/` alias for absolute imports from `src/`
2. **Forms**: Use React Hook Form with Zod validation
3. **State**: Use Zustand stores for global state
4. **Styling**: Use TailwindCSS utility classes
5. **API Calls**: Use service modules, not direct axios calls
6. **Protected Routes**: Wrap with `ProtectedRoute` component

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
