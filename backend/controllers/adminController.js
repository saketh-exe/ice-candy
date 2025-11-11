import User from '../models/User.js';
import Company from '../models/Company.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { successResponse, errorResponse, paginationMeta } from '../utils/apiResponse.js';

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filters
    const filters = {};

    if (req.query.role) {
        filters.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
        filters.isActive = req.query.isActive === 'true';
    }

    if (req.query.isApproved !== undefined) {
        filters.isApproved = req.query.isApproved === 'true';
    }

    // Search by email
    if (req.query.search) {
        filters.email = { $regex: req.query.search, $options: 'i' };
    }

    const total = await User.countDocuments(filters);

    const users = await User.find(filters)
        .populate('company', 'companyName industry verified')
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    successResponse(res, 200, 'Users retrieved successfully', {
        users,
        pagination: paginationMeta(page, limit, total),
    });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin)
 */
export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .populate('company')
        .select('-password -refreshToken');

    if (!user) {
        return errorResponse(res, 404, 'User not found');
    }

    successResponse(res, 200, 'User retrieved successfully', { user });
});

/**
 * @desc    Update user status (approve/deactivate)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin)
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
    const { isActive, isApproved } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        return errorResponse(res, 404, 'User not found');
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString() && isActive === false) {
        return errorResponse(res, 400, 'Cannot deactivate your own account');
    }

    // Update status fields
    if (isActive !== undefined) {
        user.isActive = isActive;
    }

    if (isApproved !== undefined) {
        user.isApproved = isApproved;
    }

    await user.save();

    successResponse(res, 200, 'User status updated successfully', { user });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return errorResponse(res, 404, 'User not found');
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
        return errorResponse(res, 400, 'Cannot delete your own account');
    }

    // If company user, also delete company profile
    if (user.role === 'company' && user.company) {
        await Company.findByIdAndDelete(user.company);

        // Also delete all internships posted by this company
        await Internship.deleteMany({ company: user.company });

        // Delete all applications for these internships
        await Application.deleteMany({ company: user.company });
    }

    // If student, delete all applications
    if (user.role === 'student') {
        await Application.deleteMany({ student: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    successResponse(res, 200, 'User deleted successfully');
});

/**
 * @desc    Get all internships
 * @route   GET /api/admin/internships
 * @access  Private (Admin)
 */
export const getAllInternships = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filters
    const filters = {};

    if (req.query.status) {
        filters.status = req.query.status;
    }

    if (req.query.isActive !== undefined) {
        filters.isActive = req.query.isActive === 'true';
    }

    // Search
    if (req.query.search) {
        filters.$or = [
            { title: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
        ];
    }

    const total = await Internship.countDocuments(filters);

    const internships = await Internship.find(filters)
        .populate('company', 'companyName industry')
        .populate('postedBy', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    successResponse(res, 200, 'Internships retrieved successfully', {
        internships,
        pagination: paginationMeta(page, limit, total),
    });
});

/**
 * @desc    Get single internship by ID
 * @route   GET /api/admin/internships/:id
 * @access  Private (Admin)
 */
export const getInternshipById = asyncHandler(async (req, res) => {
    const internship = await Internship.findById(req.params.id)
        .populate('company', 'companyName industry isApproved')
        .populate('postedBy', 'email');

    if (!internship) {
        return errorResponse(res, 404, 'Internship not found');
    }

    successResponse(res, 200, 'Internship retrieved successfully', { internship });
});

/**
 * @desc    Get all applications
 * @route   GET /api/admin/applications
 * @access  Private (Admin)
 */
export const getAllApplications = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filters
    const filters = {};

    if (req.query.status) {
        filters.status = req.query.status;
    }

    const total = await Application.countDocuments(filters);

    const applications = await Application.find(filters)
        .populate('student', 'email studentProfile')
        .populate('company', 'companyName')
        .populate({
            path: 'internship',
            select: 'title status location locationType isPaid stipend duration role',
            populate: {
                path: 'company',
                select: 'companyName'
            }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    successResponse(res, 200, 'Applications retrieved successfully', {
        applications,
        pagination: paginationMeta(page, limit, total),
    });
});

/**
 * @desc    Delete application
 * @route   DELETE /api/admin/applications/:id
 * @access  Private (Admin)
 */
export const deleteApplication = asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
        return errorResponse(res, 404, 'Application not found');
    }

    await Application.findByIdAndDelete(req.params.id);

    successResponse(res, 200, 'Application deleted successfully');
});

/**
 * @desc    Delete internship
 * @route   DELETE /api/admin/internships/:id
 * @access  Private (Admin)
 */
export const deleteInternship = asyncHandler(async (req, res) => {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
        return errorResponse(res, 404, 'Internship not found');
    }

    // Delete all applications for this internship
    await Application.deleteMany({ internship: req.params.id });

    await Internship.findByIdAndDelete(req.params.id);

    successResponse(res, 200, 'Internship and related applications deleted successfully');
});

/**
 * @desc    Get platform statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
export const getStats = asyncHandler(async (req, res) => {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCompanies = await User.countDocuments({ role: 'company' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const pendingApprovals = await User.countDocuments({
        role: 'company',
        isApproved: false
    });

    const totalInternships = await Internship.countDocuments();
    const activeInternships = await Internship.countDocuments({
        status: 'active',
        isActive: true
    });

    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const shortlistedApplications = await Application.countDocuments({ status: 'shortlisted' });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentInternships = await Internship.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentApplications = await Application.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const stats = {
        users: {
            total: totalUsers,
            students: totalStudents,
            companies: totalCompanies,
            active: activeUsers,
            pendingApprovals,
            recentRegistrations: recentUsers,
        },
        internships: {
            total: totalInternships,
            active: activeInternships,
            recentlyPosted: recentInternships,
        },
        applications: {
            total: totalApplications,
            pending: pendingApplications,
            shortlisted: shortlistedApplications,
            recentSubmissions: recentApplications,
        },
    };

    successResponse(res, 200, 'Statistics retrieved successfully', { stats });
});

/**
 * @desc    Verify/unverify company
 * @route   PUT /api/admin/companies/:id/verify
 * @access  Private (Admin)
 */
export const verifyCompany = asyncHandler(async (req, res) => {
    const { verified } = req.body;

    const company = await Company.findById(req.params.id);

    if (!company) {
        return errorResponse(res, 404, 'Company not found');
    }

    company.verified = verified !== undefined ? verified : true;
    await company.save();

    successResponse(res, 200, 'Company verification status updated', { company });
});
