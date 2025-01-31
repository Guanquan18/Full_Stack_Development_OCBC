require('dotenv').config();
const fetch = require('node-fetch');

const getIntent = async (req, res) => {
    const { text } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key is missing from the environment variables.' });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: `The user is navigating a banking app. Here is the user's interaction: "${text}". 
        Read the response and recognize the intent, then output the intent. Here is a list of valid intents. 
        If not in list, output error. {homepage, history, chatbot, transfer, previous page, bills, forum, helpline}. 
        Only output the intents given without additional words.` }]
            })
        });

        const data = await response.json();
        res.json({ intent: data.choices?.[0]?.message?.content?.trim() || "error" });
    } catch (error) {
        console.error("Error communicating with OpenAI API:", error);
        res.status(500).json({ error: "Failed to fetch intent." });
    }
};

module.exports = {
    getIntent
};