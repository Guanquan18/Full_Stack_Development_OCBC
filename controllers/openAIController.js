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

const generateTransactionInsights = async (req, res) => {
    const { transactions } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key is missing from the environment variables.' });
    }

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ error: "No transactions provided or invalid format." });
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
                messages: [
                    {
                        role: "system",
                        content: "You are a financial assistant that analyzes transaction data to provide insights."
                    },
                    {
                        role: "user",
                        content: `Analyze the following transactions: ${JSON.stringify(transactions)}. 
                        Calculate total income (money received by 'You') and total expenses (money sent by 'You'). 
                        Then, provide insights based on spending patterns, trends, or savings opportunities. 
                        For example: "Your expenses are higher than your income (period of time)."
                        "Your highest (day/month) of spending is (day/month) with $(amount)."
                        "You spent a total of $(amount) on (category) this (period of time)."
                        Any other insights you can provide based on the data which are helpful for financial literacy are welcome.
                        Strictly return ONLY a valid JSON object without any additional text. 
                        
                        Example JSON output format:
                        {
                          "totalIncome": <total income amount>,
                          "totalExpense": <total expense amount>,
                          "insights": ["insight 1", "insight 2", "insight 3"]
                        }`
                    }
                ],
                temperature: 0.5,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const insights = data.choices?.[0]?.message?.content?.trim() || "No insights available.";

        res.json({ insights });
    } catch (error) {
        console.error("Error communicating with OpenAI API:", error);
        res.status(500).json({ error: "Failed to generate transaction insights." });
    }
};

module.exports = { getIntent, generateTransactionInsights };