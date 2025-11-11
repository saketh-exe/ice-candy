import Internship from '../models/Internship.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { successResponse, errorResponse, paginationMeta } from '../utils/apiResponse.js';

/**
 * @desc    Get all active internships (public)
 * @route   GET /api/internships
 * @access  Public
 */
export const getInternships = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters - only active internships
    const filters = {
        status: 'active',
        isActive: true,
    };

    // Search
    if (req.query.search) {
        filters.$text = { $search: req.query.search };
    }

    // Filter by location type
    if (req.query.locationType) {
        filters.locationType = req.query.locationType;
    }

    // Filter by paid/unpaid
    if (req.query.isPaid !== undefined) {
        filters.isPaid = req.query.isPaid === 'true';
    }

    // Filter by skills
    if (req.query.skills) {
        const skillsArray = req.query.skills.split(',').map(s => s.trim());
        filters.skills = { $in: skillsArray };
    }

    const total = await Internship.countDocuments(filters);

    const internships = await Internship.find(filters)
        .populate('company', 'companyName industry location logo verified')
        .select('-postedBy')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    successResponse(res, 200, 'Internships retrieved successfully', {
        internships,
        pagination: paginationMeta(page, limit, total),
    });
});

/**
 * @desc    Get internship by ID (public)
 * @route   GET /api/internships/:id
 * @access  Public
 */
export const getInternshipById = asyncHandler(async (req, res) => {
    const internship = await Internship.findOne({
        _id: req.params.id,
        status: 'active',
        isActive: true,
    }).populate('company', 'companyName industry description location website contactInfo logo verified');

    if (!internship) {
        return errorResponse(res, 404, 'Internship not found');
    }

    // Increment view count
    internship.viewsCount += 1;
    await internship.save();

    successResponse(res, 200, 'Internship retrieved successfully', { internship });
});
