import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

let genAI;

try {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in .env");
    }

    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    console.log("✅ Gemini AI initialized successfully");
} catch (error) {
    console.error("❌ Gemini AI initialization failed:", error.message);
}

export { genAI };