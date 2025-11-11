import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  ArrowLeft,
  Building2,
  Clock,
  Users,
  FileText,
  AlertCircle,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const AdminInternshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInternship();
  }, [id]);

  const loadInternship = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/admin/internships/${id}`);
      console.log("Internship data:", response.data.data.internship);
      setInternship(response.data.data.internship);
    } catch (err) {
      console.error("Error loading internship:", err);
      setError(
        err.response?.data?.message || "Failed to load internship details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this internship? This will also delete all related applications."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await apiClient.delete(`/admin/internships/${id}`);
      alert("Internship deleted successfully");
      navigate("/admin/internships");
    } catch (err) {
      console.error("Error deleting internship:", err);
      alert(err.response?.data?.message || "Failed to delete internship");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Error Loading Internship
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => navigate("/admin/internships")}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Internships
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Internship Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The internship you're looking for doesn't exist or has been
              removed.
            </p>
            <Button
              onClick={() => navigate("/admin/internships")}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Internships
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: "success",
      closed: "secondary",
      draft: "warning",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate("/admin/internships")} variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Internships
        </Button>
        <Button
          onClick={handleDelete}
          variant="destructive"
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleting ? "Deleting..." : "Delete Internship"}
        </Button>
      </div>

      {/* Main Details */}
      <Card>
        <div className="space-y-4">
          {/* Title and Status */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{internship.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-5 w-5" />
                <span className="text-lg">
                  {internship.company?.companyName}
                </span>
              </div>
            </div>
            {getStatusBadge(internship.status)}
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted-foreground">
                  {internship.location || "Not specified"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {internship.locationType}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-muted-foreground">
                  {internship.duration?.value} {internship.duration?.type}
                </p>
              </div>
            </div>

            {/* Stipend */}
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Stipend</p>
                <p className="text-muted-foreground">
                  {internship.stipend?.amount
                    ? `${formatCurrency(
                        internship.stipend.amount,
                        internship.stipend.currency
                      )} / ${internship.stipend.period}`
                    : "Unpaid"}
                </p>
              </div>
            </div>

            {/* Openings */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Openings</p>
                <p className="text-muted-foreground">
                  {internship.openings} positions
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Role</p>
                <p className="text-muted-foreground">
                  {internship.role || "Not specified"}
                </p>
              </div>
            </div>

            {/* Application Deadline */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Application Deadline</p>
                <p className="text-muted-foreground">
                  {formatDate(internship.applicationDeadline)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Description
          </h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {internship.description}
          </p>
        </div>
      </Card>

      {/* Skills Required */}
      {internship.skillsRequired && internship.skillsRequired.length > 0 && (
        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Skills Required</h2>
            <div className="flex flex-wrap gap-2">
              {internship.skillsRequired.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Responsibilities */}
      {internship.responsibilities && (
        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Responsibilities</h2>
            <div className="text-muted-foreground whitespace-pre-wrap">
              {internship.responsibilities}
            </div>
          </div>
        </Card>
      )}

      {/* Requirements */}
      {internship.requirements && (
        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Requirements</h2>
            <div className="text-muted-foreground whitespace-pre-wrap">
              {internship.requirements}
            </div>
          </div>
        </Card>
      )}

      {/* Additional Questions */}
      {internship.additionalQuestions &&
        internship.additionalQuestions.length > 0 && (
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Additional Questions for Applicants
              </h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                {internship.additionalQuestions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          </Card>
        )}

      {/* Company Info */}
      {internship.company && (
        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </h2>
            <div className="space-y-2">
              <div>
                <p className="font-medium">Company Name</p>
                <p className="text-muted-foreground">
                  {internship.company.companyName}
                </p>
              </div>
              {internship.company.industry && (
                <div>
                  <p className="font-medium">Industry</p>
                  <p className="text-muted-foreground">
                    {internship.company.industry}
                  </p>
                </div>
              )}
              {internship.company.isApproved !== undefined && (
                <div>
                  <p className="font-medium">Company Status</p>
                  <div className="flex items-center gap-2">
                    {internship.company.isApproved ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-success">Approved</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-warning" />
                        <span className="text-warning">Pending Approval</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Posted By */}
      {internship.postedBy && (
        <Card>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Posted By</h2>
            <p className="text-muted-foreground">{internship.postedBy.email}</p>
            <p className="text-sm text-muted-foreground">
              Posted on {formatDate(internship.createdAt)}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminInternshipDetails;
