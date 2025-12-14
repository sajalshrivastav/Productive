import express from 'express';
import { getSessions, createSession, getSessionsByDate } from '../controllers/focusSessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getSessions)
    .post(protect, createSession);

router.route('/date/:dateString')
    .get(protect, getSessionsByDate);

export default router;
