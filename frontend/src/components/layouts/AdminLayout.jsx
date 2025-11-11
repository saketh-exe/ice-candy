import { Outlet } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import { useUIStore } from "@/store/uiStore";

const AdminLayout = () => {
  const { sidebarOpen } = useUIStore();

  const sidebarLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { to: "/admin/users", label: "Users", icon: "Users" },
    { to: "/admin/internships", label: "Internships", icon: "Briefcase" },
    { to: "/admin/applications", label: "Applications", icon: "FileText" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar role="admin" />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
