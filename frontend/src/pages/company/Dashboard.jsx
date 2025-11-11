import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import companyService from "@/services/companyService";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import { Briefcase, Users, FileText, Plus, AlertCircle } from "lucide-react";

const CompanyDashboard = () => {
  const { showNotification } = useUIStore();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    internships: 0,
    applications: 0,
    activeInternships: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [internshipsRes, applicationsRes] = await Promise.all([
        companyService.getInternships(),
        companyService.getAllApplications(),
      ]);

      // Handle response data structure
      const internships = internshipsRes.data?.internships || [];
      const applications = applicationsRes.data?.applications || [];

      setStats({
        internships: internships.length,
        activeInternships: internships.filter((i) => i.status === "active")
          .length,
        applications: applications.length,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load dashboard data";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your internship postings and applications
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card>
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Error Loading Dashboard</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Approval Status Warning */}
      {!user?.isApproved && (
        <Card>
          <div className="flex items-center gap-3 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Account Pending Approval</p>
              <p className="text-sm text-muted-foreground">
                Your company account is pending admin approval. You will be able
                to post internships once approved.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Internships</p>
              <p className="text-2xl font-bold">{stats.internships}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Active Internships
              </p>
              <p className="text-2xl font-bold">{stats.activeInternships}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Applications
              </p>
              <p className="text-2xl font-bold">{stats.applications}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-4">
          <Link to="/company/internships/new">
            <Button disabled={!user?.isApproved}>
              <Plus className="mr-2 h-4 w-4" />
              Post New Internship
            </Button>
          </Link>
          {/* Commented out until pages are created
          <Link to="/company/internships">
            <Button variant="outline">
              <Briefcase className="mr-2 h-4 w-4" />
              Manage Internships
            </Button>
          </Link>
          <Link to="/company/applications">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              View Applications
            </Button>
          </Link>
          */}
        </div>
        {!user?.isApproved && (
          <p className="mt-4 text-sm text-muted-foreground">
            You need admin approval before you can post internships.
          </p>
        )}
      </Card>
    </div>
  );
};

export default CompanyDashboard;
