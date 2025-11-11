import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "@/store/uiStore";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = ({ links }) => {
  const { sidebarOpen } = useUIStore();
  const location = useLocation();

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card">
      <nav className="space-y-1 p-4">
        {links.map((link) => {
          const Icon = Icons[link.icon] || Icons.Circle;
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
