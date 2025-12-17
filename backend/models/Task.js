import mongoose from 'mongoose';

const subtaskSchema = mongoose.Schema({
    title: { type: String, required: true },
    done: { type: Boolean, default: false }
});

const taskSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    dateKey: {
        type: String,
        required: true
    },
    type: {
        type: String, // 'manual', 'recurring-instance'
        default: 'manual'
    },
    priority: {
        type: String,
        default: 'P2'
    },
    category: {
        type: String,
        default: 'General'
    },
    sourceRecurringId: {
        type: String,
        required: false
    },
    status: {
        type: String,
        default: 'todo',
        enum: ['todo', 'in-progress', 'done']
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false
    },
    scheduledTime: {
        type: Date,
        required: false
    },
    estimatedDuration: {
        type: Number, // in minutes
        required: false
    },
    subtasks: [subtaskSchema]
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
