import express from 'express';
import { getInternships, getInternshipById } from '../controllers/internshipController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with optional authentication)
router.get('/', optionalAuth, getInternships);
router.get('/:id', optionalAuth, getInternshipById);

export default router;
