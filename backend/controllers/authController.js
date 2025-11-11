import User from '../models/User.js';
import Company from '../models/Company.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/generateToken.js';

/**
 * @desc    Register new user (Student or Company)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
    const { email, password, role, name, phone, university, major, graduationYear, companyName, website, industry } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return errorResponse(res, 400, 'User already exists with this email');
    }

    // Validate role (admin cannot register via API)
    if (role === 'admin') {
        return errorResponse(res, 400, 'Cannot register as admin');
    }

    // Create user object with role-specific fields
    const userData = {
        email,
        password,
        role,
    };

    // Add student-specific fields if role is student
    if (role === 'student') {
        userData.studentProfile = {};
        if (name) userData.studentProfile.name = name;
        if (phone) userData.studentProfile.phone = phone;
        if (university) userData.studentProfile.university = university;
        if (major) userData.studentProfile.major = major;
        if (graduationYear) userData.studentProfile.graduationYear = graduationYear;
    }

    // Create user
    const user = await User.create(userData);

    // If role is company, create company profile
    if (role === 'company') {
        const companyData = {
            user: user._id,
            companyName: companyName || 'Company Name', // Use provided name or placeholder
            contactInfo: {
                email: email,
            },
        };

        // Add optional company fields
        if (phone) companyData.contactInfo.phone = phone;
        if (website) companyData.website = website;
        if (industry) companyData.industry = industry;

        const company = await Company.create(companyData);

        user.company = company._id;
        await user.save();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Remove password from response
    const userResponse = user.toJSON();

    successResponse(res, 201, 'User registered successfully', {
        user: userResponse,
        accessToken,
        refreshToken,
    });
});

/**
 * @desc    Login user (all roles)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log('🔐 [AUTH] Login attempt for email:', password);

    // Check for user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return errorResponse(res, 401, 'Invalid credentials');
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        console.log("passwrd")
        return errorResponse(res, 401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
        return errorResponse(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    // Check if company is approved
    if (user.role === 'company' && !user.isApproved) {
        return errorResponse(
            res,
            403,
            'Your account is pending approval. You will be notified once approved.'
        );
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Remove password from response
    const userResponse = user.toJSON();

    successResponse(res, 200, 'Login successful', {
        user: userResponse,
        accessToken,
        refreshToken,
    });
});

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return errorResponse(res, 400, 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (!decoded) {
        return errorResponse(res, 401, 'Invalid or expired refresh token');
    }

    // Find user and verify refresh token matches
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
        return errorResponse(res, 401, 'Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    successResponse(res, 200, 'Token refreshed successfully', {
        accessToken: newAccessToken,
    });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
    // User is already attached to req by auth middleware
    const user = await User.findById(req.user._id).populate('company');

    successResponse(res, 200, 'User retrieved successfully', { user });
});

/**
 * @desc    Logout user (invalidate refresh token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
    // Remove refresh token from database
    req.user.refreshToken = undefined;
    await req.user.save();

    successResponse(res, 200, 'Logged out successfully');
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return errorResponse(res, 400, 'Please provide current and new password');
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
        return errorResponse(res, 401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    successResponse(res, 200, 'Password updated successfully');
});
