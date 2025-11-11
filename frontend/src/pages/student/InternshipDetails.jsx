import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import studentService from "@/services/studentService";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";
import Modal from "@/components/common/Modal";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const applySchema = z.object({
  coverLetter: z
    .string()
    .min(50, "Cover letter must be at least 50 characters")
    .max(1000, "Cover letter must not exceed 1000 characters"),
});

const InternshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showNotification } = useUIStore();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applySchema),
  });

  useEffect(() => {
    loadInternship();
  }, [id]);

  const loadInternship = async () => {
    try {
      setLoading(true);
      const response = await studentService.getInternshipById(id);
      console.log(response);
      setInternship(response.data.internship);
    } catch (error) {
      showNotification("Failed to load internship details", "error");
      navigate("/student/internships");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!user?.studentProfile?.resume?.path) {
      showNotification("Please upload your resume before applying", "error");
      navigate("/student/profile");
      return;
    }

    try {
      setApplying(true);
      await studentService.applyForInternship(id, data);
      showNotification("Application submitted successfully!", "success");
      setShowApplyModal(false);
      navigate("/student/applications");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to submit application",
        "error"
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!internship) return null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/student/internships")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Internships
      </Button>

      <Card>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{internship.title}</h1>
              <p className="mt-1 text-xl text-muted-foreground">
                {internship.company?.companyName}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                internship.status === "active" && internship.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {internship.status === "active" && internship.isActive
                ? "Active"
                : "Closed"}
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{internship.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="capitalize">{internship.locationType}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>
                {internship.isPaid && internship.stipend?.amount
                  ? `${internship.stipend.currency} ${internship.stipend.amount}/${internship.stipend.period}`
                  : "Unpaid"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {internship.duration?.value} {internship.duration?.type}
              </span>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {internship.description}
            </p>
          </div>

          {internship.responsibilities && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">Responsibilities</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {internship.responsibilities}
              </p>
            </div>
          )}

          {internship.requirements && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">Requirements</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {internship.requirements}
              </p>
            </div>
          )}

          {internship.skills && internship.skills.length > 0 && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {internship.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {internship.applicationDeadline && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">
                Application Deadline
              </h2>
              <p className="text-muted-foreground">
                {formatDate(internship.applicationDeadline)}
              </p>
            </div>
          )}

          {internship.isActive && (
            <Button
              size="lg"
              onClick={() => setShowApplyModal(true)}
              className="w-full md:w-auto"
            >
              Apply Now
            </Button>
          )}
        </div>
      </Card>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply for Internship"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Cover Letter *
            </label>
            <textarea
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Explain why you're interested in this internship and what makes you a good fit..."
              {...register("coverLetter")}
            />
            {errors.coverLetter && (
              <p className="mt-1 text-sm text-destructive">
                {errors.coverLetter.message}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">Your resume will be submitted:</p>
            {user?.studentProfile?.resume?.path ? (
              <a
                href={`${import.meta.env.VITE_API_BASE_URL?.replace(
                  "/api",
                  ""
                )}/${user.studentProfile.resume.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Resume ({user.studentProfile.resume.filename})
              </a>
            ) : (
              <p className="text-destructive">No resume uploaded</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowApplyModal(false)}
              disabled={applying}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={applying || !user?.studentProfile?.resume?.path}
            >
              {applying ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InternshipDetails;
