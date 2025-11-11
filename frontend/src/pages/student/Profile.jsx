import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import studentService from "@/services/studentService";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import { Upload } from "lucide-react";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  university: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.coerce
    .number()
    .min(2020)
    .max(2030)
    .optional()
    .or(z.literal(""))
    .or(z.nan()),
  skills: z.string().optional(),
  bio: z.string().max(500).optional(),
});

const StudentProfile = () => {
  const { user, updateUser } = useAuthStore();
  const { showNotification } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await studentService.getProfile();
      const profileData = response.data.profile;

      const profile = profileData.studentProfile || profileData;

      reset({
        name: profile.name || "",
        email: profileData.email || "",
        phone: profile.phone || "",
        university: profile.university || "",
        major: profile.major || "",
        graduationYear: profile.graduationYear || undefined,
        skills: profile.skills?.join(", ") || "",
        bio: profile.bio || "",
      });
    } catch (error) {
      showNotification("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log("Form data before processing:", data);

      const updateData = {
        ...data,
        skills: data.skills ? data.skills.split(",").map((s) => s.trim()) : [],
      };

      const response = await studentService.updateProfile(updateData);
      updateUser(response.data);
      showNotification("Profile updated successfully", "success");

      // Reload profile to see updated data
      await loadProfile();
    } catch (error) {
      console.error("Update error:", error);
      showNotification(
        error.response?.data?.message || "Failed to update profile",
        "error"
      );
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showNotification("Only PDF files are allowed", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("File size must be less than 5MB", "error");
      return;
    }

    try {
      setUploading(true);
      const response = await studentService.uploadResume(file);
      updateUser(response.data);
      showNotification("Resume uploaded successfully", "success");
      setResumeFile(file);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to upload resume",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Personal Information">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                type="email"
                label="Email"
                disabled
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Phone"
                error={errors.phone?.message}
                {...register("phone")}
              />

              <Input
                label="University"
                error={errors.university?.message}
                {...register("university")}
              />

              <Input
                label="Major"
                error={errors.major?.message}
                {...register("major")}
              />

              <Input
                type="number"
                label="Graduation Year"
                error={errors.graduationYear?.message}
                {...register("graduationYear", { valueAsNumber: true })}
              />

              <Input
                label="Skills (comma-separated)"
                placeholder="JavaScript, React, Node.js"
                error={errors.skills?.message}
                {...register("skills")}
              />

              <div>
                <label className="mb-1 block text-sm font-medium">Bio</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Tell us about yourself..."
                  {...register("bio")}
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={!isDirty}>
                Save Changes
              </Button>
            </form>
          </Card>
        </div>

        <div>
          <Card title="Resume">
            <div className="space-y-4">
              {user?.studentProfile?.resume?.filename || user?.resume ? (
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Current Resume</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.studentProfile?.resume?.filename || "Resume.pdf"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploaded:{" "}
                    {user?.studentProfile?.resume?.uploadedAt
                      ? new Date(
                          user.studentProfile.resume.uploadedAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No resume uploaded yet
                </p>
              )}

              <div>
                <label
                  htmlFor="resume"
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 hover:bg-accent"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {uploading ? "Uploading..." : "Upload New Resume"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PDF only, max 5MB
                  </span>
                </label>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleResumeUpload}
                  disabled={uploading}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
