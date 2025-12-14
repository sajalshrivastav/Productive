import mongoose from 'mongoose';

const focusSessionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
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
        required: true,
        enum: ['focus', 'break']
    },
    duration: {
        type: Number, // Duration in seconds
        required: true
    }
}, {
    timestamps: true
});

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);

export default FocusSession;
