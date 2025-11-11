import User from '../models/User.js';
import Company from '../models/Company.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { successResponse, errorResponse, paginationMeta } from '../utils/apiResponse.js';

/**
 * @desc    Get company profile
 * @route   GET /api/company/profile
 * @access  Private (Company)
 */
export const getProfile = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    successResponse(res, 200, 'Company profile retrieved successfully', { company });
});

/**
 * @desc    Update company profile
 * @route   PUT /api/company/profile
 * @access  Private (Company)
 */
export const updateProfile = asyncHandler(async (req, res) => {
    let company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    // Update company fields
    const allowedFields = [
        'companyName',
        'industry',
        'companySize',
        'description',
        'website',
        'founded',
        'location',
        'contactInfo',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    company = await Company.findByIdAndUpdate(company._id, updates, {
        new: true,
        runValidators: true,
    });

    successResponse(res, 200, 'Company profile updated successfully', { company });
});

/**
 * @desc    Create internship posting
 * @route   POST /api/company/internships
 * @access  Private (Company)
 */
export const createInternship = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    // Create internship with company reference
    const internship = await Internship.create({
        ...req.body,
        company: company._id,
        postedBy: req.user._id,
    });

    await internship.populate('company', 'companyName industry location');

    successResponse(res, 201, 'Internship created successfully', { internship });
});

/**
 * @desc    Get company's internships
 * @route   GET /api/company/internships
 * @access  Private (Company)
 */
export const getInternships = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const filters = { company: company._id };

    if (req.query.status) {
        filters.status = req.query.status;
    }

    const total = await Internship.countDocuments(filters);

    const internships = await Internship.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    successResponse(res, 200, 'Internships retrieved successfully', {
        internships,
        pagination: paginationMeta(page, limit, total),
    });
});

/**
 * @desc    Get single internship
 * @route   GET /api/company/internships/:id
 * @access  Private (Company)
 */
export const getInternshipById = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    const internship = await Internship.findOne({
        _id: req.params.id,
        company: company._id,
    });

    if (!internship) {
        return errorResponse(res, 404, 'Internship not found');
    }

    successResponse(res, 200, 'Internship retrieved successfully', { internship });
});

/**
 * @desc    Update internship
 * @route   PUT /api/company/internships/:id
 * @access  Private (Company)
 */
export const updateInternship = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    let internship = await Internship.findOne({
        _id: req.params.id,
        company: company._id,
    });

    if (!internship) {
        return errorResponse(res, 404, 'Internship not found or you do not have permission');
    }

    internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    successResponse(res, 200, 'Internship updated successfully', { internship });
});

/**
 * @desc    Delete internship
 * @route   DELETE /api/company/internships/:id
 * @access  Private (Company)
 */
export const deleteInternship = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    const internship = await Internship.findOne({
        _id: req.params.id,
        company: company._id,
    });

    if (!internship) {
        return errorResponse(res, 404, 'Internship not found or you do not have permission');
    }

    // Soft delete: set isActive to false
    internship.isActive = false;
    internship.status = 'closed';
    await internship.save();

    successResponse(res, 200, 'Internship deleted successfully');
});

/**
 * @desc    Get applicants for an internship
 * @route   GET /api/company/internships/:id/applicants
 * @access  Private (Company)
 */
export const getApplicants = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    // Verify internship belongs to company
    const internship = await Internship.findOne({
        _id: req.params.id,
        company: company._id,
    });

    if (!internship) {
        return errorResponse(res, 404, 'Internship not found or you do not have permission');
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filters
    const filters = { internship: req.params.id };

    if (req.query.status) {
        filters.status = req.query.status;
    }

    const total = await Application.countDocuments(filters);

    const applicants = await Application.find(filters)
        .populate('student', 'email studentProfile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    successResponse(res, 200, 'Applicants retrieved successfully', {
        applicants,
        pagination: paginationMeta(page, limit, total),
    });
});

/**
 * @desc    Update application status (shortlist/reject)
 * @route   PUT /api/company/applications/:id/status
 * @access  Private (Company)
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    // Find application and verify it belongs to company
    const application = await Application.findOne({
        _id: req.params.id,
        company: company._id,
    }).populate('internship', 'title');

    if (!application) {
        return errorResponse(res, 404, 'Application not found or you do not have permission');
    }

    // Update status
    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;

    // Add to status history
    application.statusHistory.push({
        status,
        changedBy: req.user._id,
        changedAt: new Date(),
        note,
    });

    await application.save();

    successResponse(res, 200, 'Application status updated successfully', { application });
});

/**
 * @desc    Get all applications for company
 * @route   GET /api/company/applications
 * @access  Private (Company)
 */
export const getAllApplications = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
        return errorResponse(res, 404, 'Company profile not found');
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filters
    const filters = { company: company._id };

    if (req.query.status) {
        filters.status = req.query.status;
    }

    const total = await Application.countDocuments(filters);

    const applications = await Application.find(filters)
        .populate('student', 'email studentProfile')
        .populate('internship', 'title status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    successResponse(res, 200, 'Applications retrieved successfully', {
        applications,
        pagination: paginationMeta(page, limit, total),
    });
});
