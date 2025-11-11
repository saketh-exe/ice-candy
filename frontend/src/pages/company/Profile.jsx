import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import companyService from "@/services/companyService";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import { Building2, MapPin, Globe, Phone, Mail } from "lucide-react";

const profileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  location: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      address: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
  contactInfo: z
    .object({
      email: z
        .string()
        .email("Please enter a valid email")
        .optional()
        .or(z.literal("")),
      phone: z.string().optional(),
      linkedin: z
        .string()
        .url("Please enter a valid URL")
        .optional()
        .or(z.literal("")),
    })
    .optional(),
});

const CompanyProfile = () => {
  const { showNotification } = useUIStore();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await companyService.getProfile();
      console.log("Loaded profile:", response.data);

      // Extract company data - it's nested under 'company' key
      const profile =
        response.data?.company || response.data?.profile || response.data;

      reset({
        companyName: profile.companyName || "",
        description: profile.description || "",
        industry: profile.industry || "",
        website: profile.website || "",
        location: {
          city: profile.location?.city || "",
          state: profile.location?.state || "",
          country: profile.location?.country || "",
          address: profile.location?.address || "",
          zipCode: profile.location?.zipCode || "",
        },
        contactInfo: {
          email: profile.contactInfo?.email || user?.email || "",
          phone: profile.contactInfo?.phone || "",
          linkedin: profile.contactInfo?.linkedin || "",
        },
      });
    } catch (error) {
      console.error("Load profile error:", error);
      showNotification(
        error.response?.data?.message || "Failed to load profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await companyService.updateProfile(data);

      // Update user in auth store if needed
      if (response.data?.profile) {
        updateUser({ ...user, ...response.data.profile });
      }

      showNotification("Profile updated successfully", "success");
    } catch (error) {
      console.error("Update profile error:", error);
      showNotification(
        error.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="text-muted-foreground">
          Manage your company information and details
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Company Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                {...register("companyName")}
                placeholder="Enter company name"
                className="pl-10"
                error={errors.companyName?.message}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Company Description
            </label>
            <textarea
              {...register("description")}
              placeholder="Describe your company..."
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Industry */}
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <Input
                {...register("industry")}
                placeholder="e.g., Technology, Finance"
                error={errors.industry?.message}
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  {...register("website")}
                  placeholder="https://example.com"
                  className="pl-10"
                  error={errors.website?.message}
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Input
                  {...register("location.city")}
                  placeholder="e.g., San Francisco"
                  error={errors.location?.city?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <Input
                  {...register("location.state")}
                  placeholder="e.g., California"
                  error={errors.location?.state?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Country
                </label>
                <Input
                  {...register("location.country")}
                  placeholder="e.g., United States"
                  error={errors.location?.country?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Zip Code
                </label>
                <Input
                  {...register("location.zipCode")}
                  placeholder="e.g., 94102"
                  error={errors.location?.zipCode?.message}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Address
                </label>
                <Input
                  {...register("location.address")}
                  placeholder="Street address"
                  error={errors.location?.address?.message}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="contact@company.com"
                    className="pl-10"
                    error={errors.contactInfo?.email?.message}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    {...register("contactInfo.phone")}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                    error={errors.contactInfo?.phone?.message}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  LinkedIn Profile
                </label>
                <Input
                  {...register("contactInfo.linkedin")}
                  placeholder="https://linkedin.com/company/..."
                  error={errors.contactInfo?.linkedin?.message}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CompanyProfile;
