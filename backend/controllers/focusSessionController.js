import asyncHandler from 'express-async-handler';
import FocusSession from '../models/FocusSession.js';
import { emitToUser } from '../socket.js';

// @desc    Get all focus sessions for authenticated user
// @route   GET /api/focus-sessions
// @access  Private
export const getSessions = asyncHandler(async (req, res) => {
    const sessions = await FocusSession.find({ user: req.user._id }).sort({ startTime: -1 });
    res.json(sessions);
});

// @desc    Create new focus session
// @route   POST /api/focus-sessions
// @access  Private
export const createSession = asyncHandler(async (req, res) => {
    const { startTime, endTime, type, duration } = req.body;

    if (!startTime || !endTime || !type || !duration) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const session = await FocusSession.create({
        user: req.user._id,
        startTime,
        endTime,
        type,
        duration
    });

    emitToUser(req.user._id.toString(), 'focus_sessions_updated', { action: 'create', session: session });
    res.status(201).json(session);
});

// @desc    Get focus sessions by date
// @route   GET /api/focus-sessions/date/:dateString
// @access  Private
export const getSessionsByDate = asyncHandler(async (req, res) => {
    const { dateString } = req.params;

    // Parse date string (format: YYYY-MM-DD)
    const startOfDay = new Date(dateString);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateString);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await FocusSession.find({
        user: req.user._id,
        startTime: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    }).sort({ startTime: -1 });

    res.json(sessions);
});
