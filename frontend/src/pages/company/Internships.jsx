import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import companyService from "@/services/companyService";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import Badge from "@/components/common/Badge";
import Table from "@/components/common/Table";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";

const MyInternships = () => {
  const { showNotification } = useUIStore();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadInternships();
  }, []);

  const loadInternships = async () => {
    try {
      setLoading(true);
      const response = await companyService.getInternships();
      const data = response.data?.internships || response.data || [];
      setInternships(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load internships error:", error);
      showNotification(
        error.response?.data?.message || "Failed to load internships",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this internship?")) {
      return;
    }

    try {
      setDeletingId(id);
      await companyService.deleteInternship(id);
      showNotification("Internship deleted successfully", "success");
      loadInternships();
    } catch (error) {
      console.error("Delete error:", error);
      showNotification(
        error.response?.data?.message || "Failed to delete internship",
        "error"
      );
    } finally {
      setDeletingId(null);
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const columns = [
    {
      header: "Title",
      accessor: "title",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.title}</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            {row.location} • {row.locationType}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: "Positions",
      accessor: "positions",
      cell: (row) => (
        <div>
          {row.positions} position{row.positions !== 1 ? "s" : ""}
        </div>
      ),
    },
    {
      header: "Stipend",
      accessor: "isPaid",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {row.isPaid && row.stipend ? (
            <>
              <DollarSign className="h-4 w-4" />
              {row.stipend.amount} {row.stipend.currency}/{row.stipend.period}
            </>
          ) : (
            <span className="text-muted-foreground">Unpaid</span>
          )}
        </div>
      ),
    },
    {
      header: "Duration",
      accessor: "duration",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {row.duration?.value} {row.duration?.type}
        </div>
      ),
    },
    {
      header: "Applications",
      accessor: "applicantCount",
      cell: (row) => (
        <div className="text-center font-medium">{row.applicantCount || 0}</div>
      ),
    },
    {
      header: "Actions",
      accessor: "_id",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/company/internships/${row._id}`}>
            <Button size="sm" variant="ghost">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/company/internships/${row._id}/edit`}>
            <Button size="sm" variant="ghost">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(row._id)}
            disabled={deletingId === row._id}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Internships</h1>
          <p className="text-muted-foreground">
            Manage your internship postings
          </p>
        </div>
        <Link to="/company/internships/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post New Internship
          </Button>
        </Link>
      </div>

      {internships.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No internships posted yet</p>
            </div>
            <Link to="/company/internships/new">
              <Button>Post Your First Internship</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <Table data={internships} columns={columns} />
        </Card>
      )}
    </div>
  );
};

export default MyInternships;
