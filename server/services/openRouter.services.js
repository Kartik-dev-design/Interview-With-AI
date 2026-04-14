import axios from "axios";

export const askAi = async (messages) => {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.");
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-3.5-turbo",
                messages: messages
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://interview-with-ai-client.onrender.com",
                    "X-Title": "Interview AI",
                    "User-Agent": "Mozilla/5.0"
                },
                timeout: 20000
            }
        );

        console.log("OPENROUTER RESPONSE:", response.data);

        const content = response?.data?.choices?.[0]?.message?.content;

        if (!content || !content.trim()) {
            throw new Error("AI returned empty response.");
        }

        return content;

    } catch (error) {
        console.error("OpenRouter FULL ERROR:", error.response?.data || error.message);

        throw new Error(
            error.response?.data?.error?.message || error.message
        );
    }
};
