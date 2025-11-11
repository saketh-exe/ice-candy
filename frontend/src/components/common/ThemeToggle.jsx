import { Moon, Sun } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import Button from "./Button";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useUIStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon size={18} className="transition-all" />
      ) : (
        <Sun size={18} className="transition-all" />
      )}
    </Button>
  );
};

export default ThemeToggle;
