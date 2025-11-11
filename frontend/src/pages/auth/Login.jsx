import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import authService from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "company", "admin"], {
    required_error: "Please select a role",
  }),
});

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { setLoading, showNotification } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setLoading(true);

      const response = await authService.login(data);

      setAuth(
        response.data.user,
        response.data.accessToken,
        response.data.refreshToken
      );

      showNotification("Login successful!", "success");

      // Role-based redirect
      const roleRoutes = {
        student: "/student/dashboard",
        company: "/company/dashboard",
        admin: "/admin/dashboard",
      };

      navigate(roleRoutes[data.role]);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Login failed. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "", label: "Select Role" },
    { value: "student", label: "Student" },
    { value: "company", label: "Company" },
    { value: "admin", label: "Admin" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-primary">SkillSync</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Role"
            options={roleOptions}
            error={errors.role?.message}
            {...register("role")}
          />

          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
