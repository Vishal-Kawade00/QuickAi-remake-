import { useState } from 'react';
import api from '../api/axios'; // Our custom Axios instance with JWT
import toast from 'react-hot-toast';

export const useChat = (videoUrl) => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = async (messageText) => {
        if (!messageText.trim()) return;

        // 1. Optimistically add the user's message to the UI instantly
        const newUserMsg = { role: 'user', content: messageText };
        setMessages((prev) => [...prev, newUserMsg]);
        setIsTyping(true);

        try {
            // 2. Send the message and videoUrl to your Node.js backend
            // The backend handles fetching the transcript & past history from MongoDB
            const { data } = await api.post('/youtube/chat', {
                videoUrl,
                message: messageText
            });

            if (data.success) {
                // 3. Add the AI's response to the chat array
                setMessages((prev) => [
                    ...prev, 
                    { role: 'ai', content: data.reply || data.response }
                ]);
            } else {
                toast.error(data.message || "Failed to get a response from the AI.");
            }
        } catch (error) {
            console.error("Chat Error:", error);
            toast.error(error.response?.data?.message || "An error occurred during the chat.");
        } finally {
            setIsTyping(false);
        }
    };

    return { messages, isTyping, sendMessage };
};