import mongoose from 'mongoose';

const actionSchema = mongoose.Schema({
    id: { type: String }, // Frontend UUID
    text: { type: String, required: true },
    type: { type: String, default: 'checkbox' }
});

const challengeSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    durationDays: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    dailyActions: [actionSchema],
    // History: { "YYYY-MM-DD": ["actionId1", "actionId2"] }
    history: {
        type: Map,
        of: [String],
        default: {}
    },
    status: {
        type: String, // 'active', 'completed', 'abandoned'
        default: 'active'
    }
}, {
    timestamps: true
});

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;
