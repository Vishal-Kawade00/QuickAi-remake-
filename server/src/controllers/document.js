import { genAI } from '../config/gemini.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import { extractText } from "unpdf";
import User from "../models/User.js";
import { ResumeFeedback } from "../models/Creation.js";

const cleanupFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
        console.error("File cleanup error:", err.message);
    }
};

export const reviewResume = async (req, res) => {
    const resumePath = req.file?.path;

    try {
        const userId = req.user.id;
        const resume = req.file;

        // ✅ Validate user
        const user = await User.findById(userId);
        if (!user) {
            cleanupFile(resumePath);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ Check premium
        if (user.plan !== "premium") {
            cleanupFile(resumePath);
            return res.status(403).json({ success: false, message: "Premium feature only" });
        }

        // ✅ Validate file
        if (!resume) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        if (resume.mimetype !== 'application/pdf') {
            cleanupFile(resumePath);
            return res.status(400).json({ success: false, message: "Only PDF files are allowed" });
        }
        if (resume.size > 5 * 1024 * 1024) {
            cleanupFile(resumePath);
            return res.status(400).json({ success: false, message: "File size must be under 5MB" });
        }

        // ✅ Extract text from PDF
        const dataBuffer = fs.readFileSync(resumePath);
        const { text } = await extractText(new Uint8Array(dataBuffer));
        const fullText = Array.isArray(text) ? text.join(" ").trim() : text?.trim();

        if (!fullText || fullText.length === 0) {
            cleanupFile(resumePath);
            return res.status(400).json({ success: false, message: "Unable to extract text from PDF. Make sure it is not a scanned image." });
        }

        // ✅ Generate AI feedback
        const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas of improvement. Include specific suggestions for enhancing the resume's effectiveness.\n\nResume Content:\n\n${fullText}`;

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(prompt);
        const content = result.response.text();

        if (!content) {
            cleanupFile(resumePath);
            return res.status(500).json({ success: false, message: "AI failed to generate feedback" });
        }

        // ✅ Upload to Cloudinary
        const { secure_url } = await cloudinary.uploader.upload(resumePath, {
            folder: 'resumes',
            resource_type: "raw"
        });

        // ✅ Cleanup local file after upload
        cleanupFile(resumePath);

        // ✅ Save to MongoDB
        await ResumeFeedback.create({
            userId,
            fileName: req.file.originalname,
            resumeUrl: secure_url,
            aiFeedback: content
        });

        return res.status(200).json({ success: true, content });

    } catch (error) {
        cleanupFile(resumePath);
        console.error("Resume Review Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to review resume" 
        });
    }
};