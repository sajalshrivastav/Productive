import mongoose from 'mongoose';

const habitSchema = mongoose.Schema({
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
    },
    icon: {
        type: String,
        default: '✨'
    },
    color: {
        type: String,
        default: 'pink'
    },
    frequency: {
        type: String,
        default: 'daily'
    },
    history: {
        type: Map,
        of: Boolean,
        default: {}
    },
    streak: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
