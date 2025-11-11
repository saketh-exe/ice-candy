import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { apiClient } from "@/lib/apiClient";
import {
  Search,
  Filter,
  FileText,
  Building2,
  GraduationCap,
  Calendar,
  Eye,
  ExternalLink,
} from "lucide-react";

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "") params.append(key, value);
      });

      const response = await apiClient.get(`/admin/applications?${params}`);
      setApplications(response.data.data.applications);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Application Management</h1>
          <p className="text-muted-foreground">
            Monitor all applications across the platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Status
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value, page: 1 })
              }
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="accepted">Accepted</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  status: "",
                  page: 1,
                  limit: 20,
                })
              }
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                Loading applications...
              </p>
            </div>
          </Card>
        ) : applications.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No applications found</p>
            </div>
          </Card>
        ) : (
          applications.map((application) => (
            <Card
              key={application._id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {/* Application Icon */}
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {application.internship?.title ||
                              "Internship not found"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Application ID: {application._id.slice(-8)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            application.status
                          )}`}
                        >
                          {application.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        {/* Student Info */}
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Student</p>
                            <p className="text-muted-foreground">
                              {application.student?.email ||
                                "Student not found"}
                            </p>
                          </div>
                        </div>

                        {/* Company Info */}
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Company</p>
                            <p className="text-muted-foreground">
                              {application.internship?.company?.companyName ||
                                "Company not found"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter Preview */}
                      {application.coverLetter && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">
                            Cover Letter:
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied{" "}
                          {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                        {application.updatedAt !== application.createdAt && (
                          <span>
                            Updated{" "}
                            {new Date(
                              application.updatedAt
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Status Note */}
                      {application.note && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <p className="font-medium">Note:</p>
                          <p className="text-muted-foreground">
                            {application.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/admin/applications/${application._id}`)
                    }
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(
                        `/admin/internships/${application.internship?._id}`
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Internship
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing page {pagination.currentPage} of {pagination.totalPages}(
              {pagination.totalApplications} total applications)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Applications;
