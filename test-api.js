import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set in your .env file.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function test() {
    console.log("Testing Gemini 3 Flash API...");
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Say 'API is working!'",
        });
        console.log("✅ Response:", response.text);
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

test();
