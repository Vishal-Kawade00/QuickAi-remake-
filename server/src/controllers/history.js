import { TextContent, ImageTask, ResumeFeedback } from '../models/Creation.js'; // Adjust paths
import StudySession from '../models/StudySession.js';
import ChatHistory from "../models/ChatHistory.js"

export const getCategoryHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.params;

        // 1. Handle the "All" category request
        if (type === 'all') {
            const [text, image, document, youtube, chat] = await Promise.all([
                TextContent.find({ userId }).lean(),
                ImageTask.find({ userId }).lean(),
                ResumeFeedback.find({ userId }).lean(),
                StudySession.find({ userId }).lean(),
                ChatHistory.find({ userId }).lean()
            ]);

            // Combine arrays, tag them, and sort newest first
            const combinedData = [
                ...text.map(item => ({ ...item, modelType: 'text' })),
                ...image.map(item => ({ ...item, modelType: 'image' })),
                ...document.map(item => ({ ...item, modelType: 'document' })),
                ...youtube.map(item => ({ ...item, modelType: 'youtube' })),
                ...chat.map(item => ({ ...item, modelType: 'chat' }))
            ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return res.status(200).json({ success: true, data: combinedData });
        }

        // 2. Handle specific category requests (Highly optimized)
        let data = [];
        switch (type) {
            case 'text':
                data = await TextContent.find({ userId }).sort({ createdAt: -1 }).lean();
                break;
            case 'image':
                data = await ImageTask.find({ userId }).sort({ createdAt: -1 }).lean();
                break;
            case 'document':
                data = await ResumeFeedback.find({ userId }).sort({ createdAt: -1 }).lean();
                break;
            case 'youtube':
                data = await StudySession.find({ userId }).sort({ createdAt: -1 }).lean();
                break;
            case 'chat': 
                data = await ChatHistory.find({ userId }).sort({ createdAt: -1 }).lean(); break;
            default:
                return res.status(400).json({ success: false, message: "Invalid category" });
        }

        res.status(200).json({ success: true, data });

    } catch (error) {
        console.error(`Error fetching ${req.params.type} history:`, error);
        res.status(500).json({ success: false, message: "Failed to fetch history" });
    }
};