import express from 'express';
import {
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    getAllInternships,
    getInternshipById,
    getAllApplications,
    deleteInternship,
    deleteApplication,
    getStats,
    verifyCompany,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';
import { validate, userStatusSchema } from '../middleware/validator.js';

const router = express.Router();

// All routes are protected and for admins only
router.use(protect, authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', validate(userStatusSchema), updateUserStatus);
router.delete('/users/:id', deleteUser);

// Internship management
router.get('/internships', getAllInternships);
router.get('/internships/:id', getInternshipById);
router.delete('/internships/:id', deleteInternship);

// Application management
router.get('/applications', getAllApplications);
router.delete('/applications/:id', deleteApplication);

// Company verification
router.put('/companies/:id/verify', verifyCompany);

// Statistics
router.get('/stats', getStats);

export default router;
