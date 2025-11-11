import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import authService from "@/services/authService";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["student", "company"], {
      required_error: "Please select a role",
    }),
    // Conditional fields
    phone: z.string().optional(),
    university: z.string().optional(),
    major: z.string().optional(),
    graduationYear: z.number().optional(),
    companyName: z.string().optional(),
    website: z.string().url().optional().or(z.literal("")),
    industry: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const Register = () => {
  const navigate = useNavigate();
  const { setLoading, showNotification } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setLoading(true);

      const { confirmPassword, ...registerData } = data;

      await authService.register(registerData);

      showNotification("Registration successful! Please login.", "success");
      navigate("/login");
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
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
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-primary">SkillSync</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="I am a"
            options={roleOptions}
            error={errors.role?.message}
            {...register("role")}
          />

          <Input
            type="text"
            label="Full Name"
            placeholder="Enter your full name"
            error={errors.name?.message}
            {...register("name")}
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
            placeholder="Create a password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {selectedRole === "student" && (
            <>
              <Input
                type="text"
                label="Phone"
                placeholder="Enter your phone number"
                error={errors.phone?.message}
                {...register("phone")}
              />

              <Input
                type="text"
                label="University"
                placeholder="Enter your university"
                error={errors.university?.message}
                {...register("university")}
              />

              <Input
                type="text"
                label="Major"
                placeholder="Enter your major"
                error={errors.major?.message}
                {...register("major")}
              />

              <Input
                type="number"
                label="Graduation Year"
                placeholder="2025"
                error={errors.graduationYear?.message}
                {...register("graduationYear", { valueAsNumber: true })}
              />
            </>
          )}

          {selectedRole === "company" && (
            <>
              <Input
                type="text"
                label="Company Name"
                placeholder="Enter company name"
                error={errors.companyName?.message}
                {...register("companyName")}
              />

              <Input
                type="text"
                label="Website"
                placeholder="https://example.com"
                error={errors.website?.message}
                {...register("website")}
              />

              <Input
                type="text"
                label="Industry"
                placeholder="e.g., Technology, Finance"
                error={errors.industry?.message}
                {...register("industry")}
              />

              <Input
                type="text"
                label="Phone"
                placeholder="Enter company phone"
                error={errors.phone?.message}
                {...register("phone")}
              />
            </>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
