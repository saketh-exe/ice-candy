import { Outlet } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import { useUIStore } from "@/store/uiStore";

const StudentLayout = () => {
  const { sidebarOpen } = useUIStore();

  const sidebarLinks = [
    { to: "/student/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { to: "/student/profile", label: "Profile", icon: "User" },
    {
      to: "/student/internships",
      label: "Browse Internships",
      icon: "Briefcase",
    },
    { to: "/student/applications", label: "My Applications", icon: "FileText" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar role="student" />
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

export default StudentLayout;
