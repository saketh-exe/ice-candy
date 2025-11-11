import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import studentService from "@/services/studentService";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Table from "@/components/common/Table";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import Modal from "@/components/common/Modal";
import { Eye, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const MyApplications = () => {
  const { showNotification } = useUIStore();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await studentService.getMyApplications();
      setApplications(response.data.applications || []);
    } catch (error) {
      showNotification("Failed to load applications", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await studentService.getApplicationById(id);
      setSelectedApp(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      showNotification("Failed to load application details", "error");
    }
  };

  const handleWithdraw = async (id) => {
    if (
      !window.confirm("Are you sure you want to withdraw this application?")
    ) {
      return;
    }

    try {
      setWithdrawingId(id);
      await studentService.withdrawApplication(id);
      showNotification("Application withdrawn successfully", "success");
      loadApplications();
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to withdraw application",
        "error"
      );
    } finally {
      setWithdrawingId(null);
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

  const headers = ["Internship", "Company", "Applied On", "Status", "Actions"];

  const renderRow = (app) => (
    <>
      <td className="px-4 py-3">
        <Link
          to={`/student/internships/${app.internship?._id}`}
          className="font-medium hover:text-primary"
        >
          {app.internship?.title}
        </Link>
      </td>
      <td className="px-4 py-3">{app.internship?.company?.companyName}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(app.createdAt)}
      </td>
      <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(app._id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {app.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleWithdraw(app._id)}
              disabled={withdrawingId === app._id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </>
  );

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
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your internship applications
        </p>
      </div>

      <Card>
        {applications.length > 0 ? (
          <Table headers={headers} data={applications} renderRow={renderRow} />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>You haven't applied to any internships yet</p>
            <Link to="/student/internships" className="mt-4 inline-block">
              <Button>Browse Internships</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Application Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedApp(null);
          }}
          title="Application Details"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Internship</h3>
              <p>{selectedApp.internship?.title}</p>
            </div>

            <div>
              <h3 className="font-semibold">Company</h3>
              <p>{selectedApp.internship?.company?.companyName}</p>
            </div>

            <div>
              <h3 className="font-semibold">Status</h3>
              {getStatusBadge(selectedApp.status)}
            </div>

            <div>
              <h3 className="font-semibold">Cover Letter</h3>
              <p className="text-sm text-muted-foreground">
                {selectedApp.coverLetter}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Applied On</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedApp.createdAt)}
              </p>
            </div>

            {selectedApp.feedback && (
              <div>
                <h3 className="font-semibold">Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedApp.feedback}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyApplications;
