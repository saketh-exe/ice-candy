import { errorResponse } from '../utils/apiResponse.js';

/**
 * Role-based access control middleware
 * @param  {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
    
        if (!req.user) {
            console.log('❌ [ROLE] No user in request');
            return errorResponse(res, 401, 'Not authenticated');
        }

        if (!roles.includes(req.user.role)) {
            console.log(`🚫 [ROLE] Access denied. User role '${req.user.role}' not in allowed roles:`, roles);
            return errorResponse(
                res,
                403,
                `User role '${req.user.role}' is not authorized to access this route`
            );
        }

        console.log('✅ [ROLE] Role check passed');
        next();
    };
};

/**
 * Check if user owns the resource or is admin
 * Used for update/delete operations
 */
export const authorizeOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return errorResponse(res, 401, 'Not authenticated');
    }

    const resourceUserId = req.params.userId || req.body.userId;

    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
        next();
    } else {
        return errorResponse(res, 403, 'Not authorized to access this resource');
    }
};

/**
 * Verify company ownership of internship
 */
export const authorizeCompanyInternship = async (req, res, next) => {
    try {
        if (!req.user) {
            return errorResponse(res, 401, 'Not authenticated');
        }

        if (req.user.role === 'admin') {
            return next();
        }

        if (req.user.role !== 'company') {
            return errorResponse(res, 403, 'Only companies can access this resource');
        }

        // This will be checked in the controller
        // Here we just verify the user is a company
        next();
    } catch (error) {
        return errorResponse(res, 500, 'Authorization error');
    }
};
