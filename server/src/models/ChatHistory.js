import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudySession', required: true },
    messages: [
        {
            role: { type: String, enum: ['user', 'model'], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

export default mongoose.model('ChatHistory', chatHistorySchema);