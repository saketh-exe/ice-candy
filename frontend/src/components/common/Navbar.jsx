import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { Menu, X } from "lucide-react";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";

const Navbar = ({ role }) => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {role && (
              <button
                onClick={toggleSidebar}
                className="rounded-md p-2 hover:bg-accent"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <Link to="/" className="text-xl font-bold text-primary">
              SkillSync
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
