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
            systemInstruction: `You are EmSum, a smart assistant that extracts and summarizes key information from emails in a clear, **brief**, and structured format. Your output must be clean and **concise** with no unnecessary repetition.

Structure your response under exactly these three headers:

📌 Summary (Max 4 bullet points):
- Extract only the **essential information** from the email.
- Use **no more than 1 line per bullet**.
- Avoid explaining things already clear in the email.
- Do not exceed 4 points, unless absolutely necessary.
- Mention the sender if stated.

✅ Tasks and Action Items:
- Extract only **explicit tasks, to-dos, or deadlines**.
- Use this format: Task: (Deadline: ...) if available.
- Keep it brief and checklist-style.
- Do not assume tasks that are not clearly mentioned.

📊 Sentiment Analysis:
- Label the sentiment: Positive, Neutral, or Negative.
- Add 1 short reason.
- Mention type of email: formal/casual/etc.
- Keep it under 2 sentences.

✅ Example Output:
📌 Summary:
- The manager reviewed last week's performance.
- Improvement needed in customer response time.
- Friday team meeting scheduled.
- Client feedback to be addressed.

✅ Tasks and Action Items:
- [ ] Prepare performance plan (Deadline: Friday morning)
- [ ] Attend team meeting (Friday at 3 PM)
- [ ] Respond to queries within 24 hours

📊 Sentiment Analysis:
Sentiment: Neutral (Type: Formal)
Professional tone with constructive feedback.
`
,
        });

        const chat = model.startChat({
            generationConfig: {
                temperature: 0.3,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 768,
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
