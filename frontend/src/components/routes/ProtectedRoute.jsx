import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, hasRole } = useAuthStore();

  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    console.log(
      `🚫 User role '${user?.role}' not in allowed roles, redirecting to /unauthorized`
    );
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("✅ Access granted");
  return children;
};

export default ProtectedRoute;
