import Joi from 'joi';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Validation middleware factory
 * @param {object} schema - Joi validation schema
 * @returns {function} Express middleware
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return errorResponse(res, 400, 'Validation Error', errors);
        }

        // Replace req.body with validated value
        req.body = value;
        next();
    };
};

/**
 * Validation Schemas
 */

// User Registration
export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
    }),
    role: Joi.string().valid('student', 'company').required().messages({
        'any.only': 'Role must be either student or company',
        'any.required': 'Role is required',
    }),
});

// User Login
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// Student Profile Update
export const studentProfileSchema = Joi.object({
    name: Joi.string().trim(),
    firstName: Joi.string().trim(),
    lastName: Joi.string().trim(),
    phone: Joi.string().trim(),
    dateOfBirth: Joi.date(),
    university: Joi.string().trim(),
    major: Joi.string().trim(),
    graduationYear: Joi.number().min(2020).max(2035),
    bio: Joi.string().max(500),
    skills: Joi.array().items(Joi.string()),
    interests: Joi.array().items(Joi.string()),
    education: Joi.array().items(
        Joi.object({
            institution: Joi.string().required(),
            degree: Joi.string().required(),
            fieldOfStudy: Joi.string(),
            startDate: Joi.date(),
            endDate: Joi.date(),
            cgpa: Joi.number().min(0).max(10),
            current: Joi.boolean(),
        })
    ),
    location: Joi.object({
        city: Joi.string(),
        state: Joi.string(),
        country: Joi.string(),
    }),
});

// Company Profile Update
export const companyProfileSchema = Joi.object({
    companyName: Joi.string().trim().required(),
    industry: Joi.string().trim(),
    companySize: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'),
    description: Joi.string().max(2000),
    website: Joi.string().uri(),
    founded: Joi.number().min(1800).max(new Date().getFullYear()),
    location: Joi.object({
        address: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        country: Joi.string(),
        zipCode: Joi.string(),
    }),
    contactInfo: Joi.object({
        phone: Joi.string(),
        email: Joi.string().email(),
        linkedin: Joi.string().uri(),
    }),
});

// Internship Creation
export const internshipSchema = Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().max(3000).required(),
    requirements: Joi.string().max(2000),
    responsibilities: Joi.string().max(2000),
    skills: Joi.array().items(Joi.string()),
    location: Joi.string().required(),
    locationType: Joi.string().valid('onsite', 'remote', 'hybrid'),
    duration: Joi.object({
        value: Joi.number().positive(),
        type: Joi.string().valid('months', 'weeks'),
    }),
    stipend: Joi.object({
        amount: Joi.number().min(0),
        currency: Joi.string(),
        period: Joi.string().valid('monthly', 'weekly', 'total'),
    }),
    isPaid: Joi.boolean(),
    positions: Joi.number().positive(),
    applicationDeadline: Joi.date().greater('now'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    status: Joi.string().valid('draft', 'active'),
});

// Internship Update
export const internshipUpdateSchema = Joi.object({
    title: Joi.string().trim(),
    description: Joi.string().max(3000),
    requirements: Joi.string().max(2000),
    responsibilities: Joi.string().max(2000),
    skills: Joi.array().items(Joi.string()),
    location: Joi.string(),
    locationType: Joi.string().valid('onsite', 'remote', 'hybrid'),
    duration: Joi.object({
        value: Joi.number().positive(),
        type: Joi.string().valid('months', 'weeks'),
    }),
    stipend: Joi.object({
        amount: Joi.number().min(0),
        currency: Joi.string(),
        period: Joi.string().valid('monthly', 'weekly', 'total'),
    }),
    isPaid: Joi.boolean(),
    positions: Joi.number().positive(),
    applicationDeadline: Joi.date(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    status: Joi.string().valid('draft', 'active', 'closed'),
});

// Application Creation
export const applicationSchema = Joi.object({
    coverLetter: Joi.string().max(1500),
    answers: Joi.array().items(
        Joi.object({
            question: Joi.string().required(),
            answer: Joi.string().required(),
        })
    ),
});

// Application Status Update
export const applicationStatusSchema = Joi.object({
    status: Joi.string()
        .valid('reviewed', 'shortlisted', 'rejected', 'accepted')
        .required(),
    note: Joi.string().max(500),
});

// User Status Update (Admin)
export const userStatusSchema = Joi.object({
    isActive: Joi.boolean(),
    isApproved: Joi.boolean(),
});
