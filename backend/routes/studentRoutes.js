import express from 'express';
import {
    getProfile,
    updateProfile,
    uploadResume,
    getInternships,
    getInternshipById,
    applyForInternship,
    getMyApplications,
    getApplicationById,
    withdrawApplication,
} from '../controllers/studentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';
import { uploadResume as uploadResumeMiddleware } from '../middleware/upload.js';
import { validate, studentProfileSchema, applicationSchema } from '../middleware/validator.js';

const router = express.Router();

// All routes are protected and for students only
router.use(protect, authorize('student'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', validate(studentProfileSchema), updateProfile);

// Resume upload
router.post('/resume', uploadResumeMiddleware.single('resume'), uploadResume);

// Internship browsing
router.get('/internships', getInternships);
router.get('/internships/:id', getInternshipById);

// Application routes
router.post('/apply/:internshipId', validate(applicationSchema), applyForInternship);
router.get('/applications', getMyApplications);
router.get('/applications/:id', getApplicationById);
router.delete('/applications/:id', withdrawApplication);

export default router;
