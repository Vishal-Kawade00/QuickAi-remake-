import { TextContent, ImageTask, ResumeFeedback } from '../models/Creation.js';
import StudySession from '../models/StudySession.js';

export const getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const [textContents, imageTasks, resumeFeedbacks, studySessions] = await Promise.all([
            TextContent.find({ userId }).sort({ createdAt: -1 }),
            ImageTask.find({ userId }).sort({ createdAt: -1 }),
            ResumeFeedback.find({ userId }).sort({ createdAt: -1 }),
            StudySession.find({ userId }).sort({ createdAt: -1 })
        ]);

        res.status(200).json({
            success: true,
            data: { textContents, imageTasks, resumeFeedbacks, studySessions }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to fetch history" });
    }
};