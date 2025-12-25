import asyncHandler from 'express-async-handler';
import Habit from '../models/Habit.js';
import { emitToUser } from '../socket.js';

// @desc    Get user habits
// @route   GET /api/habits
// @access  Private
const getHabits = asyncHandler(async (req, res) => {
    const habits = await Habit.find({ user: req.user._id });
    res.json(habits);
});

// @desc    Create habit
// @route   POST /api/habits
// @access  Private
const createHabit = asyncHandler(async (req, res) => {
    const { title, frequency, description, icon, color } = req.body;
    const habit = await Habit.create({
        user: req.user._id,
        title,
        frequency,
        description,
        icon,
        color,
        history: {},
        streak: 0,
        total: 0
    });
    const createdHabit = await habit.save();
    emitToUser(req.user._id.toString(), 'habits_updated', { action: 'create', habit: createdHabit });
    res.status(201).json(createdHabit);
});

// @desc    Update habit (toggle day)
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = asyncHandler(async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (habit) {
        if (habit.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        habit.title = req.body.title || habit.title;
        habit.frequency = req.body.frequency || habit.frequency;
        habit.description = req.body.description || habit.description;
        habit.icon = req.body.icon || habit.icon;
        habit.color = req.body.color || habit.color;

        if (req.body.history) {
            habit.history = req.body.history;
        }
        if (req.body.streak !== undefined) habit.streak = req.body.streak;
        if (req.body.total !== undefined) habit.total = req.body.total;

        const updatedHabit = await habit.save();
        emitToUser(req.user._id.toString(), 'habits_updated', { action: 'update', habit: updatedHabit });
        res.json(updatedHabit);
    } else {
        res.status(404);
        throw new Error('Habit not found');
    }
});

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = asyncHandler(async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (habit) {
        if (habit.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        await habit.deleteOne();
        emitToUser(req.user._id.toString(), 'habits_updated', { action: 'delete', habitId: req.params.id });
        res.json({ message: 'Habit removed' });
    } else {
        res.status(404);
        throw new Error('Habit not found');
    }
});

export { getHabits, createHabit, updateHabit, deleteHabit };
