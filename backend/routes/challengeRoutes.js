import express from 'express';
import {
    getChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge
} from '../controllers/challengeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getChallenges)
    .post(protect, createChallenge);

router.route('/:id')
    .put(protect, updateChallenge)
    .delete(protect, deleteChallenge);

export default router;
