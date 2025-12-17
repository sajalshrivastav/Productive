import mongoose from 'mongoose';

const eventSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['meeting', 'deadline', 'reminder', 'time-block'],
        default: 'time-block'
    },
    linkedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: false
    },
    linkedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrencePattern: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
