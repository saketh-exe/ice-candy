import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global error handler middleware
 * Catches all errors and sends consistent error response
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('Error:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        return errorResponse(res, 404, message);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        return errorResponse(res, 400, message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((val) => val.message);
        const message = 'Validation Error';
        return errorResponse(res, 400, message, errors);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 401, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token expired');
    }

    // Multer file upload errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return errorResponse(res, 400, 'File size too large');
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return errorResponse(res, 400, 'Unexpected file field');
        }
        return errorResponse(res, 400, `Upload error: ${err.message}`);
    }

    // Default error
    const statusCode = error.statusCode || err.statusCode || 500;
    const message = error.message || 'Server Error';

    return errorResponse(
        res,
        statusCode,
        message,
        process.env.NODE_ENV === 'development' ? err.stack : null
    );
};

export default errorHandler;

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async handler to wrap async route handlers
 * Eliminates need for try-catch in every controller
 */
export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};