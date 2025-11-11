import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import companyService from "@/services/companyService";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import Badge from "@/components/common/Badge";
import Select from "@/components/common/Select";
import Table from "@/components/common/Table";
import { Eye, Calendar, User } from "lucide-react";

const Applications = () => {
  const { showNotification } = useUIStore();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAllApplications();
      const data = response.data?.applications || response.data || [];
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load applications error:", error);
      showNotification(
        error.response?.data?.message || "Failed to load applications",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      await companyService.updateApplicationStatus(applicationId, {
        status: newStatus,
      });
      showNotification("Application status updated successfully", "success");
      loadApplications();
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
      pending: "warning",
      reviewed: "default",
      shortlisted: "info",
      accepted: "success",
      rejected: "error",
      withdrawn: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const columns = [
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
      header: "Internship",
      accessor: "internship",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.internship?.title || "N/A"}</div>
          <div className="text-sm text-muted-foreground">
            {row.internship?.location}
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
      cell: (row) => getStatusBadge(row.status),
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
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(row._id, "reviewed")}
                disabled={updatingId === row._id}
              >
                Review
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(row._id, "shortlisted")}
                disabled={updatingId === row._id}
              >
                Shortlist
              </Button>
            </>
          )}
          {row.status === "reviewed" && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(row._id, "shortlisted")}
                disabled={updatingId === row._id}
              >
                Shortlist
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(row._id, "rejected")}
                disabled={updatingId === row._id}
              >
                Reject
              </Button>
            </>
          )}
          {row.status === "shortlisted" && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(row._id, "accepted")}
                disabled={updatingId === row._id}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(row._id, "rejected")}
                disabled={updatingId === row._id}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground">
            Review and manage internship applications
          </p>
        </div>
        <div className="w-48">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: "all", label: "All Applications" },
              { value: "pending", label: "Pending" },
              { value: "reviewed", label: "Reviewed" },
              { value: "shortlisted", label: "Shortlisted" },
              { value: "accepted", label: "Accepted" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>
                {filter === "all"
                  ? "No applications received yet"
                  : `No ${filter} applications`}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <Table data={filteredApplications} columns={columns} />
        </Card>
      )}
    </div>
  );
};

export default Applications;
