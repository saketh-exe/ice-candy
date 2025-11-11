import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Protect routes - Verify JWT token and attach user to request
 */
export const protect = async (req, res, next) => {
    let token;

   

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from header
            token = req.headers.authorization.split(' ')[1];
          

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
          

            // Get user from database (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.log('❌ [AUTH] User not found in database');
                return errorResponse(res, 401, 'User not found');
            }


            // Check if user is active
            if (!req.user.isActive) {
                console.log('🚫 [AUTH] User account is not active');
                return errorResponse(res, 403, 'Your account has been deactivated');
            }

            // Check if user is approved (for companies)
            if (req.user.role === 'company' && !req.user.isApproved) {
                return errorResponse(res, 403, 'Your account is pending approval');
            }

           
            next();
        } catch (error) {
            console.error('❌ [AUTH] Error:', error.message);

            if (error.name === 'JsonWebTokenError') {
                return errorResponse(res, 401, 'Invalid token');
            }

            if (error.name === 'TokenExpiredError') {
                return errorResponse(res, 401, 'Token expired');
            }

            return errorResponse(res, 401, 'Not authorized to access this route');
        }
    }

    if (!token) {
        console.log('❌ [AUTH] No token provided');
        return errorResponse(res, 401, 'Not authorized, no token provided');
    }
};

/**
 * Optional authentication - Attach user if token is valid, but don't block request
 */
export const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Token invalid or expired, continue without user
            req.user = null;
        }
    }

    next();
};
