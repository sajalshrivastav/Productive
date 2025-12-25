import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';
import { emitToUser } from '../socket.js';

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { title, description, dateKey, type, priority, category, status, subtasks, project } = req.body;

    const task = new Task({
        user: req.user._id,
        title,
        description,
        dateKey,
        type,
        priority,
        category,
        status,
        subtasks,
        project,
        isArchived: false
    });

    const createdTask = await task.save();
    emitToUser(req.user._id.toString(), 'tasks_updated', { action: 'create', task: createdTask });
    res.status(201).json(createdTask);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        if (task.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized');
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.dateKey = req.body.dateKey || task.dateKey;
        task.type = req.body.type || task.type;
        task.priority = req.body.priority || task.priority;
        task.category = req.body.category || task.category;
        task.status = req.body.status || task.status;
        task.project = req.body.project || task.project;
        task.isArchived = req.body.isArchived !== undefined ? req.body.isArchived : task.isArchived;
        if (req.body.subtasks) {
            task.subtasks = req.body.subtasks;
        }

        const updatedTask = await task.save();
        emitToUser(req.user._id.toString(), 'tasks_updated', { action: 'update', task: updatedTask });
        res.json(updatedTask);
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        if (task.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized');
        }

        await task.deleteOne();
        emitToUser(req.user._id.toString(), 'tasks_updated', { action: 'delete', taskId: req.params.id });
        res.json({ message: 'Task removed' });
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
});

export { getTasks, createTask, updateTask, deleteTask };
