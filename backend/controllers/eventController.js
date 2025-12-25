import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';
import { emitToUser } from '../socket.js';

// @desc    Get all events for authenticated user
// @route   GET /api/events
// @access  Private
export const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ user: req.user._id })
        .populate('linkedTask', 'title')
        .populate('linkedProject', 'name color')
        .sort({ startTime: 1 });
    res.json(events);
});

// @desc    Get events by date range
// @route   GET /api/events/range
// @access  Private
export const getEventsByRange = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        res.status(400);
        throw new Error('Please provide startDate and endDate');
    }

    const events = await Event.find({
        user: req.user._id,
        startTime: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    })
        .populate('linkedTask', 'title')
        .populate('linkedProject', 'name color')
        .sort({ startTime: 1 });

    res.json(events);
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private
export const createEvent = asyncHandler(async (req, res) => {
    const { title, description, startTime, endTime, type, linkedTask, linkedProject, isRecurring, recurrencePattern } = req.body;

    if (!title || !startTime || !endTime) {
        res.status(400);
        throw new Error('Please provide title, startTime, and endTime');
    }

    const event = await Event.create({
        user: req.user._id,
        title,
        description,
        startTime,
        endTime,
        type,
        linkedTask,
        linkedProject,
        isRecurring,
        recurrencePattern
    });

    const populatedEvent = await Event.findById(event._id)
        .populate('linkedTask', 'title')
        .populate('linkedProject', 'name color');

    emitToUser(req.user._id.toString(), 'events_updated', { action: 'create', event: populatedEvent });
    res.status(201).json(populatedEvent);
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event && event.user.toString() === req.user._id.toString()) {
        event.title = req.body.title || event.title;
        event.description = req.body.description !== undefined ? req.body.description : event.description;
        event.startTime = req.body.startTime || event.startTime;
        event.endTime = req.body.endTime || event.endTime;
        event.type = req.body.type || event.type;
        event.linkedTask = req.body.linkedTask !== undefined ? req.body.linkedTask : event.linkedTask;
        event.linkedProject = req.body.linkedProject !== undefined ? req.body.linkedProject : event.linkedProject;
        event.isRecurring = req.body.isRecurring !== undefined ? req.body.isRecurring : event.isRecurring;
        event.recurrencePattern = req.body.recurrencePattern !== undefined ? req.body.recurrencePattern : event.recurrencePattern;

        const updatedEvent = await event.save();
        const populatedEvent = await Event.findById(updatedEvent._id)
            .populate('linkedTask', 'title')
            .populate('linkedProject', 'name color');

        emitToUser(req.user._id.toString(), 'events_updated', { action: 'update', event: populatedEvent });
        res.json(populatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event && event.user.toString() === req.user._id.toString()) {
        await event.deleteOne();
        emitToUser(req.user._id.toString(), 'events_updated', { action: 'delete', eventId: req.params.id });
        res.json({ message: 'Event removed' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});
