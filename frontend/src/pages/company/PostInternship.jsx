import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import companyService from "@/services/companyService";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import { ArrowLeft } from "lucide-react";

const internshipSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  location: z.string().min(2, "Location is required"),
  locationType: z.enum(["remote", "onsite", "hybrid"]),
  duration: z.object({
    value: z.number().min(1).max(12),
    type: z.enum(["months", "weeks"]).default("months"),
  }),
  isPaid: z.string().transform((val) => val === "true"),
  stipend: z
    .object({
      amount: z.number().optional(),
      currency: z.string().default("USD"),
      period: z.enum(["monthly", "weekly", "total"]).default("monthly"),
    })
    .optional(),
  positions: z.number().min(1, "Must have at least 1 position"),
  applicationDeadline: z.string().optional(),
  startDate: z.string().optional(),
  skills: z.string().optional(),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  status: z.enum(["draft", "active"]).default("active"),
});

const PostInternship = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID for editing
  const { showNotification } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEditMode = Boolean(id);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(internshipSchema),
    defaultValues: {
      isPaid: "false",
      positions: 1,
      locationType: "remote",
      duration: {
        value: 3,
        type: "months",
      },
      status: "active",
    },
  });

  const isPaid = watch("isPaid");

  useEffect(() => {
    if (isEditMode) {
      loadInternship();
    }
  }, [id]);

  const loadInternship = async () => {
    try {
      setLoading(true);
      const response = await companyService.getInternshipById(id);
      const internship = response.data?.internship || response.data;

      // Convert internship data to form format
      reset({
        title: internship.title || "",
        description: internship.description || "",
        location: internship.location || "",
        locationType: internship.locationType || "remote",
        duration: internship.duration || { value: 3, type: "months" },
        isPaid: String(internship.isPaid),
        stipend: internship.stipend || {
          amount: 0,
          currency: "USD",
          period: "monthly",
        },
        positions: internship.positions || 1,
        applicationDeadline: internship.applicationDeadline
          ? new Date(internship.applicationDeadline).toISOString().split("T")[0]
          : "",
        startDate: internship.startDate
          ? new Date(internship.startDate).toISOString().split("T")[0]
          : "",
        skills: internship.skills?.join(", ") || "",
        responsibilities: internship.responsibilities || "",
        requirements: internship.requirements || "",
        status: internship.status || "active",
      });
    } catch (error) {
      console.error("Load internship error:", error);
      showNotification(
        error.response?.data?.message || "Failed to load internship",
        "error"
      );
      navigate("/company/internships");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const internshipData = {
        title: data.title,
        description: data.description,
        location: data.location,
        locationType: data.locationType,
        duration: data.duration,
        isPaid: data.isPaid,
        positions: data.positions,
        status: data.status,
        skills: data.skills ? data.skills.split(",").map((s) => s.trim()) : [],
        responsibilities: data.responsibilities || "",
        requirements: data.requirements || "",
      };

      // Add stipend if paid
      if (data.isPaid && data.stipend?.amount) {
        internshipData.stipend = {
          amount: data.stipend.amount,
          currency: data.stipend.currency || "USD",
          period: data.stipend.period || "monthly",
        };
      }

      // Add optional dates
      if (data.applicationDeadline) {
        internshipData.applicationDeadline = new Date(
          data.applicationDeadline
        ).toISOString();
      }
      if (data.startDate) {
        internshipData.startDate = new Date(data.startDate).toISOString();
      }

      console.log("📤 Submitting internship data:", internshipData);

      if (isEditMode) {
        await companyService.updateInternship(id, internshipData);
        showNotification("Internship updated successfully!", "success");
        navigate(`/company/internships/${id}`);
      } else {
        await companyService.createInternship(internshipData);
        showNotification("Internship posted successfully!", "success");
        navigate("/company/internships");
      }
    } catch (error) {
      console.error("Post internship error:", error);
      console.error("Error response:", error.response?.data);
      showNotification(
        error.response?.data?.message || "Failed to post internship",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = [
    { value: "remote", label: "Remote" },
    { value: "onsite", label: "On-site" },
    { value: "hybrid", label: "Hybrid" },
  ];

  const paidOptions = [
    { value: "false", label: "Unpaid" },
    { value: "true", label: "Paid" },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() =>
          navigate(
            isEditMode ? `/company/internships/${id}` : "/company/internships"
          )
        }
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Internship" : "Post New Internship"}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? "Update the internship details"
            : "Fill in the details to create a new internship posting"}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Job Title *"
              placeholder="e.g., Frontend Developer Intern"
              error={errors.title?.message}
              {...register("title")}
            />

            <Input
              label="Location *"
              placeholder="e.g., New York, NY"
              error={errors.location?.message}
              {...register("location")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description *
            </label>
            <textarea
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Describe the internship role..."
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Select
              label="Location Type *"
              options={typeOptions}
              error={errors.locationType?.message}
              {...register("locationType")}
            />

            <Input
              type="number"
              label="Duration (months) *"
              error={errors.duration?.value?.message}
              {...register("duration.value", { valueAsNumber: true })}
            />

            <Input
              type="number"
              label="Positions *"
              error={errors.positions?.message}
              {...register("positions", { valueAsNumber: true })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Compensation *"
              options={paidOptions}
              {...register("isPaid")}
            />

            {isPaid === "true" && (
              <Input
                type="number"
                label="Stipend Amount (per month)"
                placeholder="5000"
                error={errors.stipend?.amount?.message}
                {...register("stipend.amount", { valueAsNumber: true })}
              />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              type="date"
              label="Application Deadline"
              error={errors.applicationDeadline?.message}
              {...register("applicationDeadline")}
            />

            <Input
              type="date"
              label="Start Date"
              error={errors.startDate?.message}
              {...register("startDate")}
            />
          </div>

          <Input
            label="Required Skills (comma-separated)"
            placeholder="React, Node.js, MongoDB"
            error={errors.skills?.message}
            {...register("skills")}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Responsibilities
            </label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Describe the responsibilities..."
              {...register("responsibilities")}
            />
            {errors.responsibilities && (
              <p className="mt-1 text-sm text-destructive">
                {errors.responsibilities.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Requirements
            </label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="List the requirements..."
              {...register("requirements")}
            />
            {errors.requirements && (
              <p className="mt-1 text-sm text-destructive">
                {errors.requirements.message}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Posting..."
                : isEditMode
                ? "Update Internship"
                : "Post Internship"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  isEditMode
                    ? `/company/internships/${id}`
                    : "/company/internships"
                )
              }
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PostInternship;
