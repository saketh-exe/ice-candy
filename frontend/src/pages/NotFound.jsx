import { Link } from "react-router-dom";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Go to Home</Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
