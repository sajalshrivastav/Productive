import asyncHandler from 'express-async-handler';
import Challenge from '../models/Challenge.js';

// @desc    Get user challenges
// @route   GET /api/challenges
// @access  Private
const getChallenges = asyncHandler(async (req, res) => {
    // Return active or all? Let's return all for now or active logic can be frontend
    const challenges = await Challenge.find({ user: req.user._id });
    res.json(challenges);
});

// @desc    Create challenge
// @route   POST /api/challenges
// @access  Private
const createChallenge = asyncHandler(async (req, res) => {
    const { title, durationDays, dailyActions } = req.body;

    const challenge = await Challenge.create({
        user: req.user._id,
        title,
        durationDays,
        dailyActions,
        history: {},
        status: 'active'
    });

    res.status(201).json(challenge);
});

// @desc    Update challenge (progress)
// @route   PUT /api/challenges/:id
// @access  Private
const updateChallenge = asyncHandler(async (req, res) => {
    const challenge = await Challenge.findById(req.params.id);

    if (challenge) {
        if (challenge.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        challenge.title = req.body.title || challenge.title;
        if (req.body.dailyActions) challenge.dailyActions = req.body.dailyActions;

        // Handle history update specially if provided
        if (req.body.history) {
            challenge.history = req.body.history;
        }

        if (req.body.status) challenge.status = req.body.status;

        const updatedChallenge = await challenge.save();
        res.json(updatedChallenge);
    } else {
        res.status(404);
        throw new Error('Challenge not found');
    }
});

// @desc    Delete challenge
// @route   DELETE /api/challenges/:id
// @access  Private
const deleteChallenge = asyncHandler(async (req, res) => {
    const challenge = await Challenge.findById(req.params.id);
    if (challenge) {
        if (challenge.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        await challenge.deleteOne();
        res.json({ message: 'Challenge removed' });
    } else {
        res.status(404);
        throw new Error('Challenge not found');
    }
});

export { getChallenges, createChallenge, updateChallenge, deleteChallenge };
