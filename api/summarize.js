import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests are allowed." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set." });
    }

    const { emailText } = req.body;
    if (!emailText) {
        return res.status(400).json({ error: "Email text is required." });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Simpler prompt to ensure fast response
        const prompt = `You are EmSum, a smart assistant. Summarize this email.
        
Structure your response under exactly these three headers:
📌 Summary: (Max 4 bullets)
✅ Tasks and Action Items: (Checklist style)
📊 Sentiment Analysis: (1 sentence)

Email Content:
${emailText}`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            // Removed complex config to speed up initial response
        });

        const text = response.text;

        const summary = text.match(/📌 Summary:([\s\S]*?)✅ Tasks and Action Items:/)?.[1].trim() || "No summary.";
        const tasks = text.match(/✅ Tasks and Action Items:([\s\S]*?)📊 Sentiment Analysis:/)?.[1].trim() || "No tasks.";
        const sentiment = text.match(/📊 Sentiment Analysis:([\s\S]*)/)?.[1].trim() || "No sentiment.";

        res.status(200).json({ summary, tasks, sentiment });
    } catch (error) {
        console.error("Vercel Function Error:", error);
        res.status(500).json({ error: "API Timeout or Error", details: error.message });
    }
}
