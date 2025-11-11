import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import companyService from "@/services/companyService";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import Badge from "@/components/common/Badge";
import Table from "@/components/common/Table";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Briefcase,
  Clock,
  User,
  Eye,
} from "lucide-react";

const CompanyInternshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [internship, setInternship] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadInternshipDetails();
    loadApplicants();
  }, [id]);

  const loadInternshipDetails = async () => {
    try {
      setLoading(true);
      const response = await companyService.getInternshipById(id);
      setInternship(response.data?.internship || response.data);
    } catch (error) {
      console.error("Load internship error:", error);
      showNotification(
        error.response?.data?.message || "Failed to load internship details",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadApplicants = async () => {
    try {
      setLoadingApplicants(true);
      const response = await companyService.getApplicants(id);
      const data = response.data?.applicants || response.data || [];
      setApplicants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load applicants error:", error);
      // Don't show error notification for applicants as it's secondary data
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this internship?")) {
      return;
    }

    try {
      setDeleting(true);
      await companyService.deleteInternship(id);
      showNotification("Internship deleted successfully", "success");
      navigate("/company/internships");
    } catch (error) {
      console.error("Delete error:", error);
      showNotification(
        error.response?.data?.message || "Failed to delete internship",
        "error"
      );
      setDeleting(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      await companyService.updateApplicationStatus(applicationId, {
        status: newStatus,
      });
      showNotification("Application status updated successfully", "success");
      loadApplicants();
    } catch (error) {
      console.error("Update status error:", error);
      showNotification(
        error.response?.data?.message || "Failed to update application status",
        "error"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: "success",
      draft: "default",
      closed: "error",
      paused: "warning",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getApplicationStatusBadge = (status) => {
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

  if (!internship) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Internship not found</p>
        <Link to="/company/internships">
          <Button className="mt-4">Back to Internships</Button>
        </Link>
      </div>
    );
  }

  const applicantColumns = [
    {
      header: "Applicant",
      accessor: "student",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">
              {row.student?.fullName || row.student?.email || "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">
              {row.student?.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Applied Date",
      accessor: "createdAt",
      cell: (row) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-4 w-4" />
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => getApplicationStatusBadge(row.status),
    },
    {
      header: "Actions",
      accessor: "_id",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/company/applications/${row._id}`}>
            <Button size="sm" variant="ghost">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {row.status === "pending" && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(row._id, "reviewed")}
              disabled={updatingId === row._id}
            >
              Review
            </Button>
          )}
          {row.status === "reviewed" && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(row._id, "shortlisted")}
              disabled={updatingId === row._id}
            >
              Shortlist
            </Button>
          )}
          {row.status === "shortlisted" && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(row._id, "accepted")}
              disabled={updatingId === row._id}
            >
              Accept
            </Button>
          )}
        </div>
      ),
    },
  ];

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
            <h1 className="text-3xl font-bold">{internship.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(internship.status)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/company/internships/${id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Internship Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">
                {internship.location} ({internship.locationType})
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">
                {internship.duration?.value} {internship.duration?.type}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Stipend</p>
              <p className="font-medium">
                {internship.isPaid && internship.stipend
                  ? `${internship.stipend.amount} ${internship.stipend.currency}/${internship.stipend.period}`
                  : "Unpaid"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Positions</p>
              <p className="font-medium">{internship.positions} available</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="font-medium">{applicants.length}</p>
            </div>
          </div>
        </Card>

        {internship.applicationDeadline && (
          <Card>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="font-medium">
                  {new Date(
                    internship.applicationDeadline
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Description */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {internship.description}
        </p>
      </Card>

      {/* Responsibilities */}
      {internship.responsibilities && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Responsibilities</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {internship.responsibilities}
          </p>
        </Card>
      )}

      {/* Requirements */}
      {internship.requirements && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Requirements</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {internship.requirements}
          </p>
        </Card>
      )}

      {/* Skills */}
      {internship.skills && internship.skills.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {internship.skills.map((skill, index) => (
              <Badge key={index} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Applicants */}
      <Card>
        <h2 className="text-xl font-bold mb-4">
          Applicants ({applicants.length})
        </h2>
        {loadingApplicants ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No applications received yet
          </div>
        ) : (
          <Table data={applicants} columns={applicantColumns} />
        )}
      </Card>
    </div>
  );
};

export default CompanyInternshipDetails;
