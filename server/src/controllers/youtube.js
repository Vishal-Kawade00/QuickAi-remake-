import { genAI } from '../config/gemini.js';
import StudySession from "../models/StudySession.js";
import ChatHistory from "../models/ChatHistory.js";
import User from "../models/User.js"; // ✅ ADD THIS
import { chunkTranscript } from "../services/transcript.js";
import { fetchTranscript } from "../services/youtube.js";

/**
 * @desc Get current logged-in user
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Summarize YouTube video
 */
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

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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

/**
 * @desc Chat with video transcript
 */
export const chatWithVideo = async (req, res) => {
    try {
        const { sessionId, videoId, videoUrl, title, message, transcript } = req.body;
        
        let currentSessionId = sessionId;

        // Auto-create or find session if sessionId is missing
        if (!currentSessionId) {
            const url = videoUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null);
            if (!url) return res.status(400).json({ success: false, message: "Video URL required to start chat" });

            let session = await StudySession.findOne({ userId: req.user.id, videoUrl: url }).sort({ createdAt: -1 });

            if (!session) {
                session = await StudySession.create({
                    userId: req.user.id,
                    videoUrl: url,
                    title: title || "YouTube Video",
                });
            }
            currentSessionId = session._id;
        }

        let chatHistory = await ChatHistory.findOne({ sessionId: currentSessionId });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                sessionId: currentSessionId, // Safely use the verified ID
                messages: [{
                    role: 'user',
                    content: `System Context: The user will ask questions about the following transcript.\n\nTranscript: ${transcript}`
                }]
            });
        }

        const formattedHistory = chatHistory.messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));

        // Note: Using the stable 1.5 flash model to prevent 404 crashes
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chat = model.startChat({ history: formattedHistory });
        
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        chatHistory.messages.push({ role: 'user', content: message });
        chatHistory.messages.push({ role: 'model', content: responseText });

        await chatHistory.save();

        res.status(200).json({ success: true, response: responseText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to process chat" });
    }
};

/**
 * @desc Generate detailed notes
 */
export const generateDetailedNotes = async (req, res) => {
    try {
        const { sessionId, videoUrl, title, transcript } = req.body;
        
        if (!transcript) {
            return res.status(400).json({ success: false, message: "Transcript is required" });
        }

        let currentSessionId = sessionId;

        // Auto-create or find session if sessionId is missing
        if (!currentSessionId) {
            if (!videoUrl) return res.status(400).json({ success: false, message: "Video URL required to generate notes" });

            let session = await StudySession.findOne({ userId: req.user.id, videoUrl }).sort({ createdAt: -1 });

            if (!session) {
                session = await StudySession.create({
                    userId: req.user.id,
                    videoUrl,
                    title: title || "YouTube Video",
                });
            }
            currentSessionId = session._id;
        }

        const chunks = chunkTranscript(transcript);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let fullNotes = "";

        for (let i = 0; i < chunks.length; i++) {
            const prompt = `Generate detailed, textbook-style notes for part ${i + 1} of this video transcript. Include Mermaid.js diagram syntax where applicable.\n\nTranscript Part:\n${chunks[i]}`;

            const result = await model.generateContent(prompt);
            fullNotes += result.response.text() + "\n\n---\n\n";
        }

        // Attach the notes to the correct session
        await StudySession.findByIdAndUpdate(currentSessionId, { notes: fullNotes });

        res.status(200).json({ success: true, notes: fullNotes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to generate detailed notes" });
    }
};

/**
 * @desc Get recent sessions
 */
export const getRecentSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await StudySession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title videoUrl createdAt');

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get transcript by video ID
 */
export const getTranscriptByVideoId = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Use your existing fetchTranscript service which should 
    // wrap a library like 'youtube-transcript'
    const transcript = await fetchTranscript(`https://www.youtube.com/watch?v=${videoId}`);

    if (!transcript) {
      return res.status(404).json({ success: false, message: "Transcript not found or disabled." });
    }

    res.status(200).json({ success: true, transcript });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};