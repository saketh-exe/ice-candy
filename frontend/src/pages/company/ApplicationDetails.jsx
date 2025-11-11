import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import companyService from "@/services/companyService";
import { useUIStore } from "@/store/uiStore";
import apiClient from "@/lib/apiClient";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import Badge from "@/components/common/Badge";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Briefcase,
  MapPin,
  Download,
} from "lucide-react";

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // For now, we'll fetch from the applications list
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      // Since there's no single application endpoint, we fetch all and filter
      const response = await companyService.getAllApplications();
      const applications = response.data?.applications || response.data || [];
      const app = applications.find((a) => a._id === id);

      if (!app) {
        showNotification("Application not found", "error");
        navigate("/company/applications");
        return;
      }

      setApplication(app);
    } catch (error) {
      console.error("Load application error:", error);
      showNotification(
        error.response?.data?.message || "Failed to load application details",
        "error"
      );
      navigate("/company/applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await companyService.updateApplicationStatus(id, { status: newStatus });
      showNotification("Application status updated successfully", "success");
      loadApplication();
    } catch (error) {
      console.error("Update status error:", error);
      showNotification(
        error.response?.data?.message || "Failed to update application status",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadResume = async () => {
    try {
      setDownloading(true);

      // Get the resume data
      const resume = application.resume;
      console.log("Resume object:", resume);

      // Get filename - prefer using filename field if it exists
      let filename;
      let filePath;

      if (typeof resume === "object") {
        filename = resume.filename;
        filePath = resume.path;
      } else {
        // If resume is just a string
        filePath = resume;
        filename = resume.split(/[\\\/]/).pop();
      }

      console.log("Filename:", filename);
      console.log("Original path:", filePath);

      if (!filename && !filePath) {
        showNotification("Resume file not available", "error");
        return;
      }

      // Use filename if available, otherwise extract from path
      const finalFilename = filename || filePath.split(/[\\\/]/).pop();

      // Build the full URL - use window.location.origin to get the base URL
      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const downloadUrl = `${baseURL}/uploads/${finalFilename}`;

      console.log("Final download URL:", downloadUrl);

      // Use native fetch instead of axios to handle URL encoding better
      const response = await fetch(downloadUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create a blob URL
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = finalFilename;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification("Resume downloaded successfully", "success");
    } catch (error) {
      console.error("Download error:", error);
      console.error("Error response:", error.response);
      showNotification(
        error.response?.data?.message ||
          error.message ||
          "Failed to download resume",
        "error"
      );
    } finally {
      setDownloading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      reviewed: "default",
      shortlisted: "info",
      accepted: "success",
      rejected: "error",
      withdrawn: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Application not found</p>
        <Link to="/company/applications">
          <Button className="mt-4">Back to Applications</Button>
        </Link>
      </div>
    );
  }

  const student = application.student || {};
  const internship = application.internship || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Application Details</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(application.status)}
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          {application.status === "pending" && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate("reviewed")}
                disabled={updating}
              >
                Start Review
              </Button>
              <Button
                onClick={() => handleStatusUpdate("shortlisted")}
                disabled={updating}
              >
                Shortlist
              </Button>
            </>
          )}
          {application.status === "reviewed" && (
            <>
              <Button
                onClick={() => handleStatusUpdate("shortlisted")}
                disabled={updating}
              >
                Shortlist
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate("rejected")}
                disabled={updating}
              >
                Reject
              </Button>
            </>
          )}
          {application.status === "shortlisted" && (
            <>
              <Button
                onClick={() => handleStatusUpdate("accepted")}
                disabled={updating}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate("rejected")}
                disabled={updating}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-bold mb-4">Student Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {student.fullName || student.email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{student.email || "N/A"}</p>
                </div>
              </div>

              {student.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{student.phone}</p>
                  </div>
                </div>
              )}

              {student.university && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">University</p>
                    <p className="font-medium">{student.university}</p>
                  </div>
                </div>
              )}

              {student.major && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Major</p>
                    <p className="font-medium">{student.major}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Cover Letter */}
          {application.coverLetter && (
            <Card>
              <h2 className="text-xl font-bold mb-4">Cover Letter</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {application.coverLetter}
              </p>
            </Card>
          )}

          {/* Resume */}
          {application.resume && (
            <Card>
              <h2 className="text-xl font-bold mb-4">Resume</h2>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">
                      {typeof application.resume === "object"
                        ? application.resume.filename || "Resume.pdf"
                        : "Resume.pdf"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {typeof application.resume === "object"
                        ? application.resume.path || ""
                        : application.resume}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadResume}
                  disabled={downloading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? "Downloading..." : "Download"}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Internship Info */}
          <Card>
            <h2 className="text-xl font-bold mb-4">Internship</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">{internship.title || "N/A"}</p>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{internship.location || "N/A"}</p>
                </div>
              </div>

              <Link to={`/company/internships/${internship._id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Internship Details
                </Button>
              </Link>
            </div>
          </Card>

          {/* Application Timeline */}
          <Card>
            <h2 className="text-xl font-bold mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Applied on</p>
                  <p className="font-medium">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {application.updatedAt &&
                application.updatedAt !== application.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last updated
                      </p>
                      <p className="font-medium">
                        {new Date(application.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
