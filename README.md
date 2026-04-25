# MailPeek - Email Summarizer

An AI-powered email summarizer that extracts key insights, tasks, and sentiment from your emails.

## Setup

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up environment variables**:
    - Copy `.env.example` to `.env`.
    - Replace `your_api_key_here` with your actual Gemini API key.
    - You can get an API key from the [Google AI Studio](https://aistudio.google.com/).

## Local Development

To test the application on your device:

1.  Install the Vercel CLI:
    ```bash
    npm install -g vercel
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```
3.  Open `http://localhost:3000` in your browser.

## Deployment

To host the application on Vercel:

1.  Push your code to a GitHub repository.
2.  Connect the repository to Vercel.
3.  Add the `GEMINI_API_KEY` environment variable in the Vercel dashboard.
4.  Deploy!

Alternatively, use the Vercel CLI:
```bash
npm run deploy
```

## Tech Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript (Vanilla)
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI**: Gemini 3 Flash API (@google/genai)
