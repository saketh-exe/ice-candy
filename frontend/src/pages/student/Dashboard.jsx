import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import studentService from "@/services/studentService";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";
import { FileText, Briefcase, User, Upload } from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const { showNotification } = useUIStore();
  const [stats, setStats] = useState({
    applications: 0,
    internships: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Loading dashboard data for user:", user);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [applicationsRes, internshipsRes] = await Promise.all([
        studentService.getMyApplications({ limit: 5 }),
        studentService.getInternships({ limit: 1 }),
      ]);

      console.log("Full Applications response:", applicationsRes);
      console.log("Full Internships response:", internshipsRes);

      // Handle different response structures
      const applicationsData =
        applicationsRes.data.data || applicationsRes.data;
      const internshipsData = internshipsRes.data.data || internshipsRes.data;

      console.log("Applications data:", applicationsData);
      console.log("Internships data:", internshipsData);

      setRecentApplications(applicationsData.applications || []);
      setStats({
        applications: applicationsData.pagination?.totalItems || 0,
        internships: internshipsData.pagination?.totalItems || 0,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      showNotification("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      shortlisted: "info",
      accepted: "success",
      rejected: "danger",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
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
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your internship applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="text-2xl font-bold">{stats.applications}</p>
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
                Available Internships
              </p>
              <p className="text-2xl font-bold">{stats.internships}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profile Status</p>
              <p className="text-2xl font-bold">
                {user?.studentProfile?.resume ? "Complete" : "Incomplete"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-4">
          <Link to="/student/internships">
            <Button>
              <Briefcase className="mr-2 h-4 w-4" />
              Browse Internships
            </Button>
          </Link>
          <Link to="/student/profile">
            <Button variant="outline">
              <User className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
          </Link>
          {!user?.resume && (
            <Link to="/student/profile">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Recent Applications */}
      <Card title="Recent Applications">
        {recentApplications.length > 0 ? (
          <div className="space-y-4">
            {recentApplications.map((application) => (
              <div
                key={application._id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <h3 className="font-semibold">
                    {application.internship?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {application.internship?.company?.companyName}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(application.status)}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Applied{" "}
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            <Link to="/student/applications">
              <Button variant="outline" className="w-full mt-8">
                View All Applications
              </Button>
            </Link>
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            <p>No applications yet</p>
            <Link to="/student/internships" className="mt-2 inline-block">
              <Button size="sm">Start Applying</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;
