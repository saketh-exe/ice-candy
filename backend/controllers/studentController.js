import User from '../models/User.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { successResponse, errorResponse, paginationMeta } from '../utils/apiResponse.js';

/**
 * @desc    Get student profile
 * @route   GET /api/student/profile
 * @access  Private (Student)
 */
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'student') {
        return errorResponse(res, 404, 'Student profile not found');
    }

    successResponse(res, 200, 'Profile retrieved successfully', { profile: user });
});

/**
 * @desc    Update student profile
 * @route   PUT /api/student/profile
 * @access  Private (Student)
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'student') {
        return errorResponse(res, 404, 'Student profile not found');
    }

    console.log('Received update data:', req.body);

    // Update student profile fields
    const allowedFields = [
        'name',
        'firstName',
        'lastName',
        'phone',
        'dateOfBirth',
        'university',
        'major',
        'graduationYear',
        'bio',
        'skills',
        'interests',
        'education',
        'location',
    ];

    const studentProfileUpdate = {};

    allowedFields.forEach((field) => {

        if (req.body[field] !== undefined && req.body[field] !== '') {
            studentProfileUpdate[field] = req.body[field];
        }
    });

    

    // Update nested studentProfile object while preserving existing nested objects
    if (!user.studentProfile) {
        user.studentProfile = {};
    }

    // Preserve existing nested objects (resume, location) if not in update
    const existingResume = user.studentProfile.resume;
    const existingLocation = user.studentProfile.location;

    user.studentProfile = {
        ...user.studentProfile.toObject(),
        ...studentProfileUpdate,
    };

    // Restore preserved nested objects if they weren't in the update
    if (!studentProfileUpdate.resume && existingResume) {
        user.studentProfile.resume = existingResume;
    }
    if (!studentProfileUpdate.location && existingLocation) {
        user.studentProfile.location = existingLocation;
    }

   

    await user.save();

    console.log('Profile saved successfully');

    successResponse(res, 200, 'Profile updated successfully', { profile: user });
});

/**
 * @desc    Upload resume
 * @route   POST /api/student/resume
 * @access  Private (Student)
 */
export const uploadResume = asyncHandler(async (req, res) => {
    if (!req.file) {
        return errorResponse(res, 400, 'Please upload a resume file');
    }

    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'student') {
        return errorResponse(res, 404, 'Student profile not found');
    }

    // Update resume information
    user.studentProfile.resume = {
        filename: req.file.filename,
        path: req.file.path,
        uploadedAt: new Date(),
    };

    await user.save();

    successResponse(res, 200, 'Resume uploaded successfully', {
        resume: user.studentProfile.resume,
    });
});

/**
 * @desc    Get all internship listings
 * @route   GET /api/student/internships
 * @access  Private (Student)
 */
export const getInternships = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const filters = {
        status: 'active',
        isActive: true,
    };

    // Search by title or skills
    if (req.query.search) {
        filters.$or = [
            { title: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { skills: { $in: [new RegExp(req.query.search, 'i')] } },
        ];
    }

    // Filter by location type
    if (req.query.locationType) {
        filters.locationType = req.query.locationType;
    }

    // Filter by paid/unpaid
    if (req.query.isPaid !== undefined) {
        filters.isPaid = req.query.isPaid === 'true';
    }

    // Get total count
    const total = await Internship.countDocuments(filters);

    // Get internships
    const internships = await Internship.find(filters)
        .populate('company', 'companyName industry location logo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    successResponse(res, 200, 'Internships retrieved successfully', {
        internships,
        pagination: paginationMeta(page, limit, total),
    });
});

/**
 * @desc    Get single internship details
 * @route   GET /api/student/internships/:id
 * @access  Private (Student)
 */
export const getInternshipById = asyncHandler(async (req, res) => {
    const internship = await Internship.findById(req.params.id)
        .populate('company', 'companyName industry description location website contactInfo logo');

    if (!internship) {
        return errorResponse(res, 404, 'Internship not found');
    }

    // Increment view count
    internship.viewsCount += 1;
    await internship.save();

    // Check if student has already applied
    const existingApplication = await Application.findOne({
        internship: internship._id,
        student: req.user._id,
    });

    successResponse(res, 200, 'Internship retrieved successfully', {
        internship,
        hasApplied: !!existingApplication,
    });
});

/**
 * @desc    Apply for an internship
 * @route   POST /api/student/apply/:internshipId
 * @access  Private (Student)
 */
export const applyForInternship = asyncHandler(async (req, res) => {
    const { internshipId } = req.params;
    const { coverLetter, answers } = req.body;

    // Check if internship exists and is active
    const internship = await Internship.findById(internshipId);

    if (!internship) {
        return errorResponse(res, 404, 'Internship not found');
    }

    if (internship.status !== 'active' || !internship.isActive) {
        return errorResponse(res, 400, 'This internship is no longer accepting applications');
    }

    // Check deadline
    if (internship.applicationDeadline && new Date() > internship.applicationDeadline) {
        return errorResponse(res, 400, 'Application deadline has passed');
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
        internship: internshipId,
        student: req.user._id,
    });

    if (existingApplication) {
        return errorResponse(res, 400, 'You have already applied for this internship');
    }

    // Get student's resume
    const student = await User.findById(req.user._id);

    if (!student.studentProfile.resume) {
        return errorResponse(res, 400, 'Please upload your resume before applying');
    }

    // Create application
    const application = await Application.create({
        internship: internshipId,
        student: req.user._id,
        company: internship.company,
        coverLetter,
        answers,
        resume: student.studentProfile.resume,
        statusHistory: [
            {
                status: 'pending',
                changedAt: new Date(),
            },
        ],
    });

    await application.populate('internship', 'title company');

    successResponse(res, 201, 'Application submitted successfully', { application });
});

/**
 * @desc    Get student's applications
 * @route   GET /api/student/applications
 * @access  Private (Student)
 */
export const getMyApplications = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const filters = { student: req.user._id };

    if (req.query.status) {
        filters.status = req.query.status;
    }

    const total = await Application.countDocuments(filters);

    const applications = await Application.find(filters)
        .populate('internship', 'title location locationType stipend status')
        .populate('company', 'companyName logo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    successResponse(res, 200, 'Applications retrieved successfully', {
        applications,
        pagination: paginationMeta(page, limit, total),
    });
});

/**
 * @desc    Get application details
 * @route   GET /api/student/applications/:id
 * @access  Private (Student)
 */
export const getApplicationById = asyncHandler(async (req, res) => {
    const application = await Application.findOne({
        _id: req.params.id,
        student: req.user._id,
    })
        .populate('internship')
        .populate('company', 'companyName logo contactInfo');

    if (!application) {
        return errorResponse(res, 404, 'Application not found');
    }

    successResponse(res, 200, 'Application retrieved successfully', { application });
});

/**
 * @desc    Withdraw application
 * @route   DELETE /api/student/applications/:id
 * @access  Private (Student)
 */
export const withdrawApplication = asyncHandler(async (req, res) => {
    const application = await Application.findOne({
        _id: req.params.id,
        student: req.user._id,
    });

    if (!application) {
        return errorResponse(res, 404, 'Application not found');
    }

    // Only allow withdrawal if status is pending or reviewed
    if (!['pending', 'reviewed'].includes(application.status)) {
        return errorResponse(
            res,
            400,
            'Cannot withdraw application at this stage'
        );
    }

    // Update status to withdrawn
    application.status = 'withdrawn';
    application.statusHistory.push({
        status: 'withdrawn',
        changedBy: req.user._id,
        changedAt: new Date(),
    });

    await application.save();

    successResponse(res, 200, 'Application withdrawn successfully');
});
