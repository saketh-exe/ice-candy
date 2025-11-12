import Company from '../models/Company.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { calculateRecommendationScore } from '../utils/matchingAlgorithm.js';

/**
 * @desc    Get recommendations for company's open internships
 * @route   GET /api/company/recommendations
 * @access  Private (Company)
 */
export const getRecommendations = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    // Get company's open internships with applications
    const internshipsWithApplicants = await getInternshipsWithApplicants(company._id);

    if (!internshipsWithApplicants || internshipsWithApplicants.length === 0) {
        return successResponse(res, 200, 'No open internships found', {
            recommendations: [],
        });
    }

    // Process recommendations for each internship
    const recommendations = await processRecommendations(internshipsWithApplicants);

    successResponse(res, 200, 'Recommendations retrieved successfully', {
        recommendations,
        totalInternships: recommendations.length,
    });
});

/**
 * @desc    Get recommendations for a specific internship
 * @route   GET /api/company/recommendations/:internshipId
 * @access  Private (Company)
 */
export const getInternshipRecommendations = asyncHandler(async (req, res) => {
    const { internshipId } = req.params;
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    // Verify internship belongs to company
    const internship = await Internship.findOne({
        _id: internshipId,
        company: company._id,
    });

    if (!internship) {
        return errorResponse(
            res,
            404,
            'Internship not found or does not belong to your company'
        );
    }

    // Get applications for this internship
    const applicantsData = await getApplicantsForInternship(internshipId);

    if (!applicantsData || applicantsData.length === 0) {
        return successResponse(res, 200, 'No applications found for this internship', {
            internship: {
                id: internship._id,
                title: internship.title,
            },
            recommendations: [],
        });
    }

    // Process recommendations for this specific internship
    const recommendations = await processInternshipRecommendations(
        internship,
        applicantsData
    );

    successResponse(res, 200, 'Internship recommendations retrieved successfully', {
        internship: {
            id: internship._id,
            title: internship.title,
            skills: internship.skills,
            requirements: internship.requirements,
        },
        recommendations,
        totalApplicants: recommendations.length,
    });
});

/**
 * Helper: Get all open internships with their applications for a company
 * @param {ObjectId} companyId - Company's MongoDB ObjectId
 * @returns {Array} Array of internships with applications
 */
async function getInternshipsWithApplicants(companyId) {
    const internships = await Internship.find({
        company: companyId,
        status: { $in: ['active', 'draft'] },
        isActive: true,
    })
        .select('_id title skills requirements description location applicationsCount')
        .lean();

    // For each internship, get applications with student and resume data
    const internshipsWithApps = await Promise.all(
        internships.map(async (internship) => {
            const applications = await Application.find({
                internship: internship._id,
                status: { $in: ['pending', 'reviewed', 'shortlisted'] }, // Include shortlisted applications
            })
                .populate({
                    path: 'student',
                    select: 'email studentProfile',
                })
                .select('student resume coverLetter answers status createdAt')
                .lean();

            return {
                ...internship,
                applications,
            };
        })
    );

    // Return all internships (including those with no applications)
    return internshipsWithApps;
}

/**
 * Helper: Get applicants for a specific internship
 * @param {String} internshipId - Internship ID
 * @returns {Array} Array of applications with student data
 */
async function getApplicantsForInternship(internshipId) {
    const applications = await Application.find({
        internship: internshipId,
        status: { $in: ['pending', 'reviewed', 'shortlisted'] },
    })
        .populate({
            path: 'student',
            select: 'email studentProfile',
        })
        .select('student resume coverLetter answers status createdAt')
        .sort({ createdAt: -1 })
        .lean();

    return applications;
}

/**
 * Helper: Process recommendations for multiple internships
 * @param {Array} internshipsWithApplicants - Internships with applications
 * @returns {Array} Processed recommendations
 */
async function processRecommendations(internshipsWithApplicants) {
    return internshipsWithApplicants.map((internship) => {
        const applicants = internship.applications.map((app) => {
            // Calculate recommendation score using matching algorithm
            console.log("application ", app);
            const scoreData = calculateRecommendationScore({
                requiredSkills: internship.skills || [],
                studentSkills: app.student.studentProfile?.skills || [],
                internshipRequirements: internship.requirements || '',
                coverLetter: app.coverLetter || '',
                studentMajor: app.student.studentProfile?.major || '',
                studentEducation: app.student.studentProfile?.education || [],
                studentUniversity: app.student.studentProfile?.university || '',
            });

            return {
                applicationId: app._id,
                studentId: app.student._id,
                studentEmail: app.student.email,
                studentName: app.student.studentProfile?.name || 'N/A',
                studentSkills: app.student.studentProfile?.skills || [],
                studentEducation: app.student.studentProfile?.education || [],
                studentUniversity: app.student.studentProfile?.university || 'N/A',
                studentMajor: app.student.studentProfile?.major || 'N/A',
                resumePath: app.resume?.path || null,
                resumeFilename: app.resume?.filename || null,
                coverLetter: app.coverLetter || null,
                applicationStatus: app.status,
                appliedAt: app.createdAt,
       
                recommendationScore: scoreData.overallScore,
                matchReason: scoreData.matchReason,
                skillsMatch: scoreData.skillMatch,
                scoreBreakdown: scoreData.breakdown,
            };
        });

        // Sort applicants by recommendation score (highest first)
        const sortedApplicants = applicants.sort(
            (a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0)
        );

        return {
            internshipId: internship._id,
            internshipTitle: internship.title,
            internshipSkills: internship.skills || [],
            internshipRequirements: internship.requirements || '',
            totalApplicants: applicants.length,
            applicants: sortedApplicants,
        };
    });
}

/**
 * Helper: Process recommendations for a single internship
 * @param {Object} internship - Internship document
 * @param {Array} applicantsData - Applications data
 * @returns {Array} Processed recommendations
 */
async function processInternshipRecommendations(internship, applicantsData) {
    const processedApplicants = applicantsData.map((app) => {
        // Calculate recommendation score
        const scoreData = calculateRecommendationScore({
            requiredSkills: internship.skills || [],
            studentSkills: app.student.studentProfile?.skills || [],
            internshipRequirements: internship.requirements || '',
            coverLetter: app.coverLetter || '',
            studentMajor: app.student.studentProfile?.major || '',
            studentEducation: app.student.studentProfile?.education || [],
            studentUniversity: app.student.studentProfile?.university || '',
        });

        return {
            applicationId: app._id,
            studentId: app.student._id,
            studentEmail: app.student.email,
            studentName: app.student.studentProfile?.name || 'N/A',
            studentSkills: app.student.studentProfile?.skills || [],
            studentEducation: app.student.studentProfile?.education || [],
            studentUniversity: app.student.studentProfile?.university || 'N/A',
            studentMajor: app.student.studentProfile?.major || 'N/A',
            studentGraduationYear:
                app.student.studentProfile?.graduationYear || null,
            resumePath: app.resume?.path || null,
            resumeFilename: app.resume?.filename || null,
            coverLetter: app.coverLetter || null,
            applicationStatus: app.status,
            appliedAt: app.createdAt,
            // AI-powered recommendation
            recommendationScore: scoreData.overallScore,
            matchReason: scoreData.matchReason,
            skillsMatch: scoreData.skillMatch,
            scoreBreakdown: scoreData.breakdown,
        };
    });

    // Sort by score (highest first)
    return processedApplicants.sort(
        (a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0)
    );
}

/**
 * @desc    Get applicant data with resume for recommendation processing
 * @route   POST /api/company/recommendations/analyze
 * @access  Private (Company)
 */
export const analyzeApplicant = asyncHandler(async (req, res) => {
    const { applicationId } = req.body;
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    // Get application with full details
    const application = await Application.findOne({
        _id: applicationId,
        company: company._id,
    })
        .populate({
            path: 'student',
            select: 'email studentProfile',
        })
        .populate({
            path: 'internship',
            select: 'title skills requirements description',
        })
        .lean();

    if (!application) {
        return errorResponse(
            res,
            404,
            'Application not found or does not belong to your company'
        );
    }

    // Prepare data for recommendation analysis
    const analysisData = {
        application: {
            id: application._id,
            status: application.status,
            coverLetter: application.coverLetter,
            appliedAt: application.createdAt,
        },
        student: {
            id: application.student._id,
            email: application.student.email,
            name: application.student.studentProfile?.name || 'N/A',
            skills: application.student.studentProfile?.skills || [],
            education: application.student.studentProfile?.education || [],
            university: application.student.studentProfile?.university || 'N/A',
            major: application.student.studentProfile?.major || 'N/A',
            graduationYear: application.student.studentProfile?.graduationYear || null,
        },
        resume: {
            path: application.resume?.path || null,
            filename: application.resume?.filename || null,
        },
        internship: {
            id: application.internship._id,
            title: application.internship.title,
            skills: application.internship.skills || [],
            requirements: application.internship.requirements || '',
            description: application.internship.description || '',
        },
    };

    // TODO: Implement recommendation logic here
    // This is where you would:
    // 1. Parse the resume from the file path
    // 2. Compare resume content with internship requirements
    // 3. Generate a recommendation score
    // 4. Provide match reasons

    successResponse(res, 200, 'Applicant data retrieved for analysis', {
        analysisData,
        message: 'Recommendation logic to be implemented',
    });
});
