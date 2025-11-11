import { Outlet } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import { useUIStore } from "@/store/uiStore";

const CompanyLayout = () => {
  const { sidebarOpen } = useUIStore();

  const sidebarLinks = [
    { to: "/company/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { to: "/company/profile", label: "Company Profile", icon: "Building2" },
    { to: "/company/internships", label: "My Internships", icon: "Briefcase" },
    { to: "/company/internships/new", label: "Post Internship", icon: "Plus" },
    { to: "/company/applications", label: "Applications", icon: "FileText" },
    {
      to: "/company/recommendations",
      label: "AI Recommendations",
      icon: "TrendingUp",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar role="company" />
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

export default CompanyLayout;
