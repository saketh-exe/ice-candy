import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Mail,
  Calendar,
  FileText,
  MapPin,
  Briefcase,
  DollarSign,
  Trash2,
  AlertCircle,
} from "lucide-react";

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch from admin applications endpoint with details
      const response = await apiClient.get(
        `/admin/applications?page=1&limit=100`
      );
      const apps = response.data.data.applications;
      const app = apps.find((a) => a._id === id);

      if (!app) {
        setError("Application not found");
        return;
      }
      console.log("Application data:", app);
      setApplication(app);
    } catch (error) {
      console.error("Error fetching application:", error);
      setError(
        error.response?.data?.message || "Failed to load application details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this application? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      // Note: You'll need to add a delete endpoint in the backend
      await apiClient.delete(`/admin/applications/${id}`);
      alert("Application deleted successfully");
      navigate("/admin/applications");
    } catch (error) {
      console.error("Error deleting application:", error);
      alert(error.response?.data?.message || "Failed to delete application");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "shortlisted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "accepted":
        return "bg-purple-100 text-purple-800";
      case "withdrawn":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/admin/applications")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
        <Card>
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm text-muted-foreground">
                {error || "Application not found"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/admin/applications")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleting ? "Deleting..." : "Delete Application"}
        </Button>
      </div>

      {/* Application Header */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Application Details</h1>
            <p className="text-sm text-muted-foreground">
              ID: {application._id}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
              application.status
            )}`}
          >
            {application.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Applied</p>
              <p className="text-sm text-muted-foreground">
                {new Date(application.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          {application.updatedAt !== application.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(application.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Student Information */}
      <Card title="Student Information">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Student</p>
              <p className="text-sm text-muted-foreground">
                {application.student?.email || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Contact</p>
              <a
                href={`mailto:${application.student?.email}`}
                className="text-sm text-primary hover:underline"
              >
                {application.student?.email}
              </a>
            </div>
          </div>
        </div>
      </Card>

      {/* Internship Information */}
      {application.internship && (
        <Card title="Internship Information">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {application.internship.title}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4" />
                {application.internship.company?.companyName || "N/A"}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{application.internship.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">
                  {application.internship.locationType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  {application.internship.isPaid &&
                  application.internship.stipend?.amount
                    ? `${application.internship.stipend.currency} ${application.internship.stipend.amount}`
                    : "Unpaid"}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                navigate(`/admin/internships/${application.internship._id}`)
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              View Full Internship Details
            </Button>
          </div>
        </Card>
      )}

      {/* Cover Letter */}
      {application.coverLetter && (
        <Card title="Cover Letter">
          <p className="text-muted-foreground whitespace-pre-wrap">
            {application.coverLetter}
          </p>
        </Card>
      )}

      {/* Additional Questions */}
      {application.answers && application.answers.length > 0 && (
        <Card title="Additional Questions">
          <div className="space-y-4">
            {application.answers.map((answer, index) => (
              <div
                key={index}
                className="border-b pb-4 last:border-b-0 last:pb-0"
              >
                <p className="font-medium mb-2">{answer.question}</p>
                <p className="text-muted-foreground">{answer.answer}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Status Note */}
      {application.note && (
        <Card title="Status Note">
          <p className="text-muted-foreground">{application.note}</p>
        </Card>
      )}
    </div>
  );
};

export default ApplicationDetails;
