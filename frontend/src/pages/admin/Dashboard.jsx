import { useState, useEffect } from "react";
import Card from "@/components/common/Card";
import { apiClient } from "@/lib/apiClient";
import {
  Users,
  Briefcase,
  FileText,
  Building2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/stats");
      setStats(response.data.data.stats);
      setError(null);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError(error.response?.data?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and management
          </p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and management
          </p>
        </div>
        <Card>
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Error Loading Statistics</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats?.users?.total || 0}</p>
              <p className="text-xs text-muted-foreground">
                {stats?.users?.active || 0} active
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Companies</p>
              <p className="text-2xl font-bold">
                {stats?.users?.companies || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.users?.pendingApprovals || 0} pending
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Internships</p>
              <p className="text-2xl font-bold">
                {stats?.internships?.total || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.internships?.active || 0} active
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="text-2xl font-bold">
                {stats?.applications?.total || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.applications?.pending || 0} pending
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Recent Activity">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm">New Registrations</span>
              </div>
              <span className="text-sm font-medium">
                {stats?.users?.recentRegistrations || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Recent Internships</span>
              </div>
              <span className="text-sm font-medium">
                {stats?.internships?.recentlyPosted || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Recent Applications</span>
              </div>
              <span className="text-sm font-medium">
                {stats?.applications?.recentSubmissions || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card title="User Breakdown">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Students</span>
              <span className="text-sm font-medium">
                {stats?.users?.students || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Companies</span>
              <span className="text-sm font-medium">
                {stats?.users?.companies || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Approvals</span>
              <span className="text-sm font-medium text-yellow-600">
                {stats?.users?.pendingApprovals || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Platform Management">
        <p className="text-muted-foreground">
          Use the sidebar to manage users, internships, and applications.
        </p>
      </Card>
    </div>
  );
};

export default AdminDashboard;
