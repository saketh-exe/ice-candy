import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import Notification from "@/components/common/Notification";

// Layouts
import PublicLayout from "@/components/layouts/PublicLayout";
import StudentLayout from "@/components/layouts/StudentLayout";
import CompanyLayout from "@/components/layouts/CompanyLayout";
import AdminLayout from "@/components/layouts/AdminLayout";

// Protected Route
import ProtectedRoute from "@/components/routes/ProtectedRoute";

// Public Pages
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Unauthorized from "@/pages/auth/Unauthorized";
import NotFound from "@/pages/NotFound";

// Student Pages
import StudentDashboard from "@/pages/student/Dashboard";
import StudentProfile from "@/pages/student/Profile";
import BrowseInternships from "@/pages/student/BrowseInternships";
import InternshipDetails from "@/pages/student/InternshipDetails";
import MyApplications from "@/pages/student/MyApplications";

// Company Pages
import CompanyDashboard from "@/pages/company/Dashboard";
import CompanyProfile from "@/pages/company/Profile";
import CompanyInternships from "@/pages/company/Internships";
import CompanyInternshipDetails from "@/pages/company/InternshipDetails";
import PostInternship from "@/pages/company/PostInternship";
import CompanyApplications from "@/pages/company/Applications";
import CompanyApplicationDetails from "@/pages/company/ApplicationDetails";
import Recommendations from "@/pages/company/Recommendations";
import InternshipRecommendations from "@/pages/company/InternshipRecommendations";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminInternships from "@/pages/admin/Internships";
import AdminApplications from "@/pages/admin/Applications";
import ApplicationDetails from "@/pages/admin/ApplicationDetails";
import AdminInternshipDetails from "@/pages/admin/InternshipDetails";

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { theme } = useUIStore();

  // Apply theme on mount and when theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Redirect authenticated users from home based on role
  const HomeRedirect = () => {
    console.log("🏠 [HomeRedirect] Checking navigation...");
    console.log("🔐 Authenticated:", isAuthenticated);
    console.log("👤 User:", user);

    if (isAuthenticated && user) {
      const roleRoutes = {
        student: "/student/dashboard",
        company: "/company/dashboard",
        admin: "/admin/dashboard",
      };
      const destination = roleRoutes[user.role] || "/";
      console.log(`➡️ Redirecting to: ${destination}`);
      return <Navigate to={destination} replace />;
    }
    console.log("📄 Showing Home page");
    return <Home />;
  };

  return (
    <BrowserRouter>
      <Notification />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="internships" element={<BrowseInternships />} />
          <Route path="applications" element={<MyApplications />} />
        </Route>

        {/* Shared Internship Details Route (accessible by all authenticated users) */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student", "company", "admin"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="internships/:id" element={<InternshipDetails />} />
        </Route>

        {/* Company Routes */}
        <Route
          path="/company"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CompanyLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CompanyDashboard />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="internships" element={<CompanyInternships />} />
          <Route path="internships/new" element={<PostInternship />} />
          <Route
            path="internships/:id"
            element={<CompanyInternshipDetails />}
          />
          <Route path="internships/:id/edit" element={<PostInternship />} />
          <Route path="applications" element={<CompanyApplications />} />
          <Route
            path="applications/:id"
            element={<CompanyApplicationDetails />}
          />
          <Route path="recommendations" element={<Recommendations />} />
          <Route
            path="recommendations/:internshipId"
            element={<InternshipRecommendations />}
          />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="internships" element={<AdminInternships />} />
          <Route path="internships/:id" element={<AdminInternshipDetails />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="applications/:id" element={<ApplicationDetails />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
