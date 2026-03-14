import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoUrl: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String },
    notes: { type: String },
    // diagrams: { type: String }
}, { timestamps: true });

export default mongoose.model('StudySession', studySessionSchema);