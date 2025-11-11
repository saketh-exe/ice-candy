import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import companyService from "@/services/companyService";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import Badge from "@/components/common/Badge";
import { Users, Briefcase, TrendingUp, FileText } from "lucide-react";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const navigate = useNavigate();
  const { showNotification } = useUIStore();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await companyService.getRecommendations();
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      showNotification(
        error.response?.data?.message || "Failed to fetch recommendations",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const viewInternshipDetails = (internshipId) => {
    navigate(`/company/recommendations/${internshipId}`);
  };

  const viewApplicationDetails = (applicationId) => {
    navigate(`/company/applications/${applicationId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">AI Recommendations</h1>
        </div>

        <Card>
          <div className="text-center py-12">
            <TrendingUp
              size={48}
              className="mx-auto text-muted-foreground mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">
              No Recommendations Available
            </h3>
            <p className="text-muted-foreground mb-4">
              You don't have any open internships with applications yet.
            </p>
            <Button onClick={() => navigate("/company/internships/new")}>
              Post New Internship
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Recommendations</h1>
          <p className="text-muted-foreground mt-1">
            View recommended candidates for your internships
          </p>
        </div>
        <Button onClick={fetchRecommendations} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Briefcase className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open Internships</p>
              <p className="text-2xl font-bold">{recommendations.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Applicants</p>
              <p className="text-2xl font-bold">
                {recommendations.reduce(
                  (sum, rec) => sum + rec.totalApplicants,
                  0
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Avg. per Internship
              </p>
              <p className="text-2xl font-bold">
                {Math.round(
                  recommendations.reduce(
                    (sum, rec) => sum + rec.totalApplicants,
                    0
                  ) / recommendations.length
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.internshipId} className="p-6">
            {/* Internship Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {recommendation.internshipTitle}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {recommendation.internshipSkills
                    ?.slice(0, 5)
                    .map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  {recommendation.internshipSkills?.length > 5 && (
                    <Badge variant="secondary">
                      +{recommendation.internshipSkills.length - 5} more
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  <Users size={16} className="inline mr-1" />
                  {recommendation.totalApplicants} applicant
                  {recommendation.totalApplicants !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                onClick={() =>
                  viewInternshipDetails(recommendation.internshipId)
                }
                variant="outline"
              >
                View Details
              </Button>
            </div>

            {/* Top Applicants Preview */}
            {recommendation.applicants.length > 0 ? (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Top Applicants
                </h4>
                <div className="space-y-3">
                  {recommendation.applicants.slice(0, 3).map((applicant) => (
                    <div
                      key={applicant.applicationId}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{applicant.studentName}</p>
                          {applicant.recommendationScore !== null && (
                            <Badge
                              variant={
                                applicant.recommendationScore >= 80
                                  ? "success"
                                  : applicant.recommendationScore >= 60
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {applicant.recommendationScore}% Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {applicant.studentEmail}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {applicant.studentSkills
                            ?.slice(0, 3)
                            .map((skill, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={
                            applicant.applicationStatus === "pending"
                              ? "default"
                              : applicant.applicationStatus === "reviewed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {applicant.applicationStatus}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() =>
                            viewApplicationDetails(applicant.applicationId)
                          }
                        >
                          <FileText size={14} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {recommendation.applicants.length > 3 && (
                  <Button
                    variant="ghost"
                    className="w-full mt-3"
                    onClick={() =>
                      viewInternshipDetails(recommendation.internshipId)
                    }
                  >
                    View all {recommendation.applicants.length} applicants
                  </Button>
                )}
              </div>
            ) : (
              <div className="border-t pt-4">
                <div className="text-center py-6 text-muted-foreground">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No applications yet</p>
                  <p className="text-xs mt-1">
                    Applications will appear here once students apply
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
