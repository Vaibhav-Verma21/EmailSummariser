import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests are allowed." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set in environment." });
    }

    const { emailText } = req.body;
    if (!emailText) {
        return res.status(400).json({ error: "Email text is required." });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            systemInstruction: `You are EmSum, an intelligent email summarizer bot.
Your job is to process a given email and output the following structured sections:

📌 Summary (in bullet points):
Summarize the key points of the email clearly and concisely.
Use bullet points to list the main information or updates from the sender.
Maintain a professional tone, and avoid repetition.
Include the name of the sender if it's mentioned in the email.

✅ Tasks and Action Items:
Extract any tasks, follow-ups, or to-do items mentioned in the email.
If a deadline is mentioned, include it.
If there are special instructions or requirements, list them alongside the tasks.
Format as a bullet list or checklist.
Try using the format- Task: deadline/date: venue
Example:
- Prepare slides for Monday’s meeting (Deadline: April 12)
- Respond to client feedback (ASAP)

📊 Sentiment Analysis:
Analyze the tone of the email and summarize it in 1-2 sentences.
Choose from: Positive, Neutral, or Negative.
Optionally, briefly explain why the sentiment was chosen (e.g., "The email includes praise and shows appreciation for the work done").
Mention type of email: formal/casual/ etc etc.
Ensure all outputs are clean, easy to scan, and structured exactly under the three headers:
Summary, Tasks and Action Items, and Sentiment Analysis.

Example Output Format:
📌 Summary:
- The manager reviewed last week's performance.
- There's a need to improve customer response time.
- A team meeting is scheduled for Friday.

✅ Tasks and Action Items:
- [ ] Prepare performance improvement plan (Deadline: Friday morning)
- [ ] Attend team meeting (Friday at 3 PM)
- [ ] Respond to customer queries within 24 hours

📊 Sentiment Analysis:
Sentiment: Neutral (Type: Formal)
The email is informative and professional but doesn’t express strong positive or negative emotions.`,
        });

        const chat = model.startChat({
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 8192,
                responseMimeType: "text/plain",
            },
        });

        const result = await chat.sendMessage(emailText);
        const text = result.response.text();

        const summary = text.match(/📌 Summary:([\s\S]*?)✅ Tasks and Action Items:/)?.[1].trim() || "No summary.";
        const tasks = text.match(/✅ Tasks and Action Items:([\s\S]*?)📊 Sentiment Analysis:/)?.[1].trim() || "No tasks.";
        const sentiment = text.match(/📊 Sentiment Analysis:([\s\S]*)/)?.[1].trim() || "No sentiment.";

        res.status(200).json({ summary, tasks, sentiment });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Server error", details: error.message });
    }
}
