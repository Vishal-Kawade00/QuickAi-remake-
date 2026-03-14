import { genAI } from '../config/gemini.js';
import StudySession from "../models/StudySession.js";
import ChatHistory from "../models/ChatHistory.js";
import { chunkTranscript } from "../services/transcript.js";
import { fetchTranscript } from "../services/youtube.js";

export const summarizeVideo = async (req, res) => {
    try {
        const userId = req.user.id;
        let { videoUrl, title, transcript } = req.body;

        if (!videoUrl) {
            return res.status(400).json({ success: false, message: "Video URL is required" });
        }

        if (!transcript) {
            transcript = await fetchTranscript(videoUrl);
        }

        const prompt = `Provide a concise, highly structured summary of the following YouTube video transcript. Highlight the main ideas, key takeaways, and output in clean Markdown.\n\nTranscript:\n${transcript}`;
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        const session = await StudySession.create({
            userId,
            videoUrl,
            title: title || "YouTube Video Summary",
            summary
        });

        res.status(200).json({ success: true, sessionId: session._id, summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to summarize video" });
    }
};

export const chatWithVideo = async (req, res) => {
    try {
        const { sessionId, message, transcript } = req.body;
        
        let chatHistory = await ChatHistory.findOne({ sessionId });
        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                sessionId,
                messages: [{ role: 'user', content: `System Context: The user will ask questions about the following transcript. \n\nTranscript: ${transcript}` }]
            });
        }

        const formattedHistory = chatHistory.messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const chat = model.startChat({ history: formattedHistory });
        
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        chatHistory.messages.push({ role: 'user', content: message });
        chatHistory.messages.push({ role: 'model', content: responseText });
        await chatHistory.save();

        res.status(200).json({ success: true, response: responseText });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to process chat" });
    }
};

export const generateDetailedNotes = async (req, res) => {
    try {
        const { sessionId, transcript } = req.body;
        
        if (!sessionId || !transcript) {
            return res.status(400).json({ success: false, message: "Session ID and transcript are required" });
        }

        const chunks = chunkTranscript(transcript);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        let fullNotes = "";

        for (let i = 0; i < chunks.length; i++) {
            const prompt = `Generate detailed, textbook-style notes for part ${i + 1} of this video transcript. Include Mermaid.js diagram syntax where applicable to visualize complex concepts.\n\nTranscript Part:\n${chunks[i]}`;
            const result = await model.generateContent(prompt);
            fullNotes += result.response.text() + "\n\n---\n\n";
        }

        await StudySession.findByIdAndUpdate(sessionId, { notes: fullNotes });
        res.status(200).json({ success: true, notes: fullNotes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to generate detailed notes" });
    }
};