import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import studentService from "@/services/studentService";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";
import { Search, MapPin, Briefcase, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const BrowseInternships = () => {
  const { showNotification } = useUIStore();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: "",
    isPaid: "",
  });

  useEffect(() => {
    loadInternships();
  }, []);

  const loadInternships = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.location) params.location = filters.location;
      if (filters.type) params.locationType = filters.type;
      if (filters.isPaid !== "") params.isPaid = filters.isPaid;

      const response = await studentService.getInternships(params);
      setInternships(response.data.internships || []);
    } catch (error) {
      showNotification("Failed to load internships", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadInternships();
  };

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "remote", label: "Remote" },
    { value: "onsite", label: "On-site" },
    { value: "hybrid", label: "Hybrid" },
  ];

  const paidOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Paid" },
    { value: "false", label: "Unpaid" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Internships</h1>
        <p className="text-muted-foreground">
          Discover internship opportunities that match your skills
        </p>
      </div>

      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Search by title or company..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />

            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
            />

            <Select
              options={typeOptions}
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            />

            <Select
              options={paidOptions}
              value={filters.isPaid}
              onChange={(e) =>
                setFilters({ ...filters, isPaid: e.target.value })
              }
            />
          </div>

          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </form>
      </Card>

      {/* Internship List */}
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : internships.length > 0 ? (
        <div className="grid gap-6">
          {internships.map((internship) => (
            <Card key={internship._id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {internship.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {internship.company?.companyName}
                    </p>
                  </div>
                  <Badge
                    variant={internship.isActive ? "success" : "secondary"}
                  >
                    {internship.isActive ? "Active" : "Closed"}
                  </Badge>
                </div>

                <p className="text-sm">{internship.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {internship.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {internship.locationType}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {internship.isPaid && internship.stipend?.amount
                      ? `${internship.stipend.currency} ${internship.stipend.amount}`
                      : "Unpaid"}
                  </div>
                </div>

                {internship.skills && internship.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {internship.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Link to={`/student/internships/${internship._id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="py-12 text-center text-muted-foreground">
            <p>No internships found matching your criteria</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BrowseInternships;
