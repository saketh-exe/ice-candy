import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { apiClient } from "@/lib/apiClient";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Calendar,
  Building2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

const Internships = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchInternships();
  }, [filters]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "") params.append(key, value);
      });

      const response = await apiClient.get(`/admin/internships?${params}`);
      setInternships(response.data.data.internships);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Error fetching internships:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInternship = async (internshipId) => {
    if (!confirm("Are you sure you want to delete this internship?")) return;

    try {
      await apiClient.delete(`/admin/internships/${internshipId}`);
      fetchInternships(); // Refresh list
    } catch (error) {
      console.error("Error deleting internship:", error);
      alert("Failed to delete internship");
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-red-100 text-red-800";
      case "filled":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLocationTypeColor = (type) => {
    switch (type) {
      case "remote":
        return "bg-purple-100 text-purple-800";
      case "onsite":
        return "bg-blue-100 text-blue-800";
      case "hybrid":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Internship Management</h1>
          <p className="text-muted-foreground">
            Manage all internships on the platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search internships..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
            />
          </div>

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
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="filled">Filled</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  status: "",
                  search: "",
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

      {/* Internships List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                Loading internships...
              </p>
            </div>
          </Card>
        ) : internships.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No internships found</p>
            </div>
          </Card>
        ) : (
          internships.map((internship) => (
            <Card
              key={internship._id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {/* Company Logo Placeholder */}
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {internship.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {internship.company?.companyName ||
                              "Company not found"}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              internship.status
                            )}`}
                          >
                            {internship.status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationTypeColor(
                              internship.locationType
                            )}`}
                          >
                            {internship.locationType}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {internship.location}
                        </span>
                        {internship.isPaid && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {internship.stipend?.currency}{" "}
                            {internship.stipend?.amount}/
                            {internship.stipend?.period}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {internship.duration?.value}{" "}
                          {internship.duration?.type}
                        </span>
                      </div>

                      {/* Skills */}
                      {internship.skills && internship.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {internship.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-muted text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {internship.skills.length > 5 && (
                            <span className="px-2 py-1 bg-muted text-xs rounded">
                              +{internship.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {internship.applicationsCount || 0} Applications
                        </span>
                        <span className="text-muted-foreground">
                          Posted{" "}
                          {new Date(internship.createdAt).toLocaleDateString()}
                        </span>
                        {internship.applicationDeadline && (
                          <span className="text-muted-foreground">
                            Deadline:{" "}
                            {new Date(
                              internship.applicationDeadline
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/admin/internships/${internship._id}`)
                    }
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteInternship(internship._id)}
                  >
                    <Trash2 className="h-4 w-4" />
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
              {pagination.totalInternships} total internships)
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

export default Internships;
