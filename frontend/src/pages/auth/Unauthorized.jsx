import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

const Unauthorized = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <h2 className="mt-4 text-2xl font-semibold">Unauthorized</h2>
        <p className="mt-2 text-muted-foreground">
          You don't have permission to access this page.
        </p>
        {user && (
          <p className="mt-2 text-sm text-muted-foreground">
            You are logged in as: <strong>{user.email}</strong> ({user.role})
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <Link to="/" className="inline-block">
            <Button className="w-full">Go to Home</Button>
          </Link>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized;
