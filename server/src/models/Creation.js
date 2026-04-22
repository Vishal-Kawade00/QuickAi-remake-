import mongoose from 'mongoose';

const textContentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['article', 'blog-title'], required: true }
}, { timestamps: true });

const imageTaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: { type: String }, // Added: Optional, since BG removal doesn't use a prompt
    processedImageUrl: { type: String },
    taskType: { type: String, enum: ['generation', 'background_removal', 'object_removal'], required: true },
    publish: { type: Boolean, default: false }
}, { timestamps: true });

const resumeFeedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String }, // Added: To display "John_Doe_Resume.pdf" in the history UI safely
    resumeUrl: { type: String, required: true },
    aiFeedback: { type: String, required: true }
}, { timestamps: true });

export const TextContent = mongoose.model('TextContent', textContentSchema);
export const ImageTask = mongoose.model('ImageTask', imageTaskSchema);
export const ResumeFeedback = mongoose.model('ResumeFeedback', resumeFeedbackSchema);