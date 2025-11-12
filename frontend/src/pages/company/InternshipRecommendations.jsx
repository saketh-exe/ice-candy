import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import companyService from "@/services/companyService";
import { useUIStore } from "@/store/uiStore";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import Badge from "@/components/common/Badge";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Mail,
  FileText,
  Download,
  TrendingUp,
} from "lucide-react";

const InternshipRecommendations = () => {
  const { internshipId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useUIStore();

  useEffect(() => {
    fetchRecommendations();
  }, [internshipId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await companyService.getInternshipRecommendations(
        internshipId
      );
      setData(response.data);
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

  const viewApplication = (applicationId) => {
    navigate(`/company/applications/${applicationId}`);
  };

  const downloadResume = (resumePath, filename) => {
    if (!resumePath) {
      showNotification("Resume not available", "error");
      return;
    }
    // TODO: Implement resume download
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    window.open(`${baseUrl}/${resumePath}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/company/recommendations")}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <Card>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recommendations found</p>
          </div>
        </Card>
      </div>
    );
  }

  const { internship, recommendations, totalApplicants } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/company/recommendations")}
        >
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{internship.title}</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered candidate recommendations
          </p>
        </div>
        <Button onClick={fetchRecommendations} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Internship Info */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {internship.skills?.map((skill, idx) => (
            <Badge key={idx} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
        {internship.requirements && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Requirements</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {internship.requirements}
            </p>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Applicants</p>
              <p className="text-2xl font-bold">{totalApplicants}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} className="text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold">
                {
                  recommendations.filter(
                    (r) => r.applicationStatus === "pending"
                  ).length
                }
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">With Resume</p>
              <p className="text-2xl font-bold">
                {recommendations.filter((r) => r.resumePath).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Applicants List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recommended Candidates</h2>

        {recommendations.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No applicants yet</p>
            </div>
          </Card>
        ) : (
          recommendations.map((applicant) => (
            <Card key={applicant.applicationId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">
                      {applicant.studentName}
                    </h3>
                    <Badge
                      variant={
                        applicant.applicationStatus === "pending"
                          ? "default"
                          : applicant.applicationStatus === "reviewed"
                          ? "secondary"
                          : applicant.applicationStatus === "shortlisted"
                          ? "success"
                          : "outline"
                      }
                    >
                      {applicant.applicationStatus}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {applicant.studentEmail}
                    </span>
                    {applicant.studentUniversity && (
                      <span className="flex items-center gap-1">
                        <GraduationCap size={14} />
                        {applicant.studentUniversity}
                      </span>
                    )}
                  </div>

                  {/* Education */}
                  {applicant.studentEducation?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Education</p>
                      {applicant.studentEducation
                        .slice(0, 2)
                        .map((edu, idx) => (
                          <p
                            key={idx}
                            className="text-sm text-muted-foreground"
                          >
                            {edu.degree} in {edu.fieldOfStudy} -{" "}
                            {edu.institution}
                            {edu.cgpa && ` (CGPA: ${edu.cgpa})`}
                          </p>
                        ))}
                    </div>
                  )}

                  {/* Skills */}
                  {applicant.studentSkills?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {applicant.studentSkills.map((skill, idx) => (
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
                  )}

                  {/* Cover Letter Preview */}
                  {applicant.coverLetter && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Cover Letter</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {applicant.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* AI Recommendation */}
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp size={16} />
                        Recommendation Score
                      </p>
                      {applicant.recommendationScore !== null && (
                        <Badge
                          variant={
                            applicant.recommendationScore >= 80
                              ? "success"
                              : applicant.recommendationScore >= 60
                              ? "default"
                              : applicant.recommendationScore >= 40
                              ? "secondary"
                              : "outline"
                          }
                          className="text-lg px-3 py-1"
                        >
                          {applicant.recommendationScore}%
                        </Badge>
                      )}
                    </div>
                    {applicant.matchReason && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {applicant.matchReason}
                      </p>
                    )}
                    {applicant.skillsMatch && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Skills Match
                          </span>
                          <span className="font-medium">
                            {applicant.skillsMatch.matched}/
                            {applicant.skillsMatch.total} (
                            {applicant.skillsMatch.percentage}%)
                          </span>
                        </div>
                        {applicant.skillsMatch.matchedSkills?.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Matched Skills:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {applicant.skillsMatch.matchedSkills.map(
                                (skill, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="default"
                                    className="text-xs bg-green-500/10 text-green-700 dark:text-green-400"
                                  >
                                    ✓ {skill}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {applicant.skillsMatch.missingSkills?.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Missing Skills:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {applicant.skillsMatch.missingSkills.map(
                                (skill, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs opacity-60"
                                  >
                                    ✗ {skill}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {applicant.resumePath && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        downloadResume(
                          applicant.resumePath,
                          applicant.resumeFilename
                        )
                      }
                    >
                      <Download size={14} className="mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => viewApplication(applicant.applicationId)}
                  >
                    <FileText size={14} className="mr-1" />
                    View Details
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                <span>
                  Applied: {new Date(applicant.appliedAt).toLocaleDateString()}
                </span>
                {applicant.studentGraduationYear && (
                  <span>Graduating: {applicant.studentGraduationYear}</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default InternshipRecommendations;
