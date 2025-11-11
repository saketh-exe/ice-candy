import express from 'express';
import {
    getProfile,
    updateProfile,
    createInternship,
    getInternships,
    getInternshipById,
    updateInternship,
    deleteInternship,
    getApplicants,
    updateApplicationStatus,
    getAllApplications,
} from '../controllers/companyController.js';
import {
    getRecommendations,
    getInternshipRecommendations,
    analyzeApplicant,
} from '../controllers/recommendationController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';
import {
    validate,
    companyProfileSchema,
    internshipSchema,
    internshipUpdateSchema,
    applicationStatusSchema,
} from '../middleware/validator.js';

const router = express.Router();

// All routes are protected and for companies only
router.use(protect, authorize('company'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', validate(companyProfileSchema), updateProfile);

// Internship routes
router.post('/internships', validate(internshipSchema), createInternship);
router.get('/internships', getInternships);
router.get('/internships/:id', getInternshipById);
router.put('/internships/:id', validate(internshipUpdateSchema), updateInternship);
router.delete('/internships/:id', deleteInternship);

// Applicant management
router.get('/internships/:id/applicants', getApplicants);
router.get('/applications', getAllApplications);
router.put('/applications/:id/status', validate(applicationStatusSchema), updateApplicationStatus);

// Recommendation routes
router.get('/recommendations', getRecommendations);
router.get('/recommendations/:internshipId', getInternshipRecommendations);
router.post('/recommendations/analyze', analyzeApplicant);

export default router;
