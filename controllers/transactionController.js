// Created By: Sairam (S10259930H)
const Transaction = require("../models/transaction"); // Adjust the path as needed
const fetch = require("node-fetch");
require("dotenv").config();

// Controller function to get transaction expenses
const getExpenses = async (req, res) => {
    const profileId = req.params.profileId;
    try {
        // Call the model method to fetch expenses
        const expenses = await Transaction.getExpenses(profileId);
        // Send response back to the client
        return res.status(200).json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return res.status(500).json({ error: "An error occurred while retrieving expenses." });
    }
};

// Controller function to get transaction history
const getTransactionHistory = async (req, res) => {
    const { rangeOption, startDate, endDate } = req.query;;
    const accNum = req.params.accNum;

    try {
        // Call the model method to fetch transaction history
        const transactions = await Transaction.getTransactionHistory(accNum, rangeOption, startDate, endDate);
        
        // Send response back to the client
        return res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        return res.status(500).json({ error: "An error occurred while retrieving transaction history." });
    }
};

// Retrieve list of recipients for a profile that is logged in (kesh)
const getRecipients = async (req, res) => {
    const profileId = req.params.profileId;
    try {
        const recipients = await Transaction.getRecipients(profileId);
        res.status(200).json(recipients);
    } catch (error) {
        console.error("Error fetching recipients:", error);
        res.status(500).json({ error: "An error occurred while retrieving recipients." });
    }
};

// Adding a new recipient (kesh)
// Add a new recipient
const addRecipient = async (req, res) => {
    const { profileId, recipientName, bankName, accNum } = req.body;
    try {
        const result = await Transaction.addRecipient(profileId, recipientName, bankName, accNum);

        // Check if the response contains an error
        if (result.error) {
            // Set the appropriate HTTP status code based on the error message
            if (result.error === "Recipient already exists with this profile and account number.") {
                return res.status(400).json({ error: result.error }); // Bad request for existing recipient
            } else if (result.error === "The specified account number does not exist.") {
                return res.status(404).json({ error: result.error }); // Not found for non-existent account number
            }
        }

        // Success: Send the recipient details in the response
        res.status(201).json(result); // HTTP 201 Created
    } catch (error) {
        console.error("Error adding recipient:", error);

        // Internal server error
        res.status(500).json({ error: "An error occurred while adding the recipient." });
    }
};



// Performing a transfer to the recipient (kesh)
const performTransfer = async (req, res) => {
    const { accSender, accReceiver, amount , transactPurpose} = req.body;
    try {
        const result = await Transaction.performTransfer(accSender, accReceiver, amount, transactPurpose);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error performing transfer:", error);
        res.status(500).json({ error: "An error occurred while performing the transfer." });
    }
};

// Performing a foreign exchange transaction - sairam
const performForeignExchange = async (req, res) => {
    const { accSender, accReceiver, exchangeRate, amount } = req.body;

    try {
        // Validate inputs
        if (!accSender || !accReceiver || !exchangeRate || !amount) {
            return res.status(400).json({ error: "All fields (accSender, accReceiver, exchangeRate, amount) are required." });
        }
        if (amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than zero." });
        }
        if (exchangeRate <= 0) {
            return res.status(400).json({ error: "Exchange rate must be greater than zero." });
        }

        // Call the model method to perform the foreign exchange
        const result = await Transaction.performForeignExchange(accSender, accReceiver, exchangeRate, amount);

        // Send success response
        res.status(200).json(result);
    } catch (error) {
        console.error("Error performing foreign exchange:", error);

        // Handle errors and send appropriate response
        if (error.message === "Invalid sender or receiver account.") {
            res.status(400).json({ error: "Invalid sender or receiver account. Please check the account details." });
        } else if (error.message === "Insufficient balance for foreign exchange.") {
            res.status(400).json({ error: "Insufficient balance for the foreign exchange transaction." });
        } else {
            res.status(500).json({ error: "An error occurred while performing the foreign exchange transaction." });
        }
    }
};
// Convert currency - sairam
const API_KEY = process.env.EXCHANGE_API_KEY;
const convertCurrency = async (req, res) => {
    const { from, to, amount } = req.query;

    try {
        // Validate inputs
        if (!from || !to || !amount) {
            return res.status(400).json({ error: "All query parameters (from, to, amount) are required." });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than zero." });
        }

        // Fetch conversion data from the API
        const apiUrl = `https://api.exchangeratesapi.io/v1/convert?access_key=${API_KEY}&from=${from}&to=${to}&amount=${amount}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Check if the API response is successful
        if (data.success) {
            return res.status(200).json({
                from: data.query.from,
                to: data.query.to,
                amount: data.query.amount,
                rate: data.info.rate,
                convertedAmount: data.result,
                date: data.date,
            });
        } else {
            console.error("Error from exchange rates API:", data.error);
            return res.status(500).json({ error: "Failed to convert currency. Please try again later." });
        }
    } catch (error) {
        console.error("Error converting currency:", error);
        return res.status(500).json({ error: "An error occurred while converting currency." });
    }
};

const getHistoricalRates = async (req, res) => {
    let { from, to } = req.query;

    try {
        if (!from || !to) {
            return res.status(400).json({ error: "Both 'from' and 'to' currencies are required." });
        }
        from = from.trim();
        to = to.trim();

        // Get today's date
        const today = new Date();
        const endDate = today.toISOString().split("T")[0];
        console.log("End Date (today):", endDate);

        // Calculate the date 7 days ago
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const startDate = oneWeekAgo.toISOString().split("T")[0];
        console.log("Start Date (one week ago):", startDate);

        // Generate the list of dates for the past week
        const dateList = [];
        let currentDate = new Date(startDate);
        while (currentDate <= today) {
            dateList.push(currentDate.toISOString().split("T")[0]);
            currentDate.setDate(currentDate.getDate() + 1); // Increment by one day
        }

        // Fetch rates for each date
        const rateResults = [];
        for (const date of dateList) {
            const apiUrl = `https://api.exchangeratesapi.io/v1/${date}?access_key=${process.env.EXCHANGE_API_KEY}&base=${from}&symbols=${to}`;
            console.log("Fetching for date:", date, "URL:", apiUrl);

            const response = await fetch(apiUrl);

            if (!response.ok) {
                console.error(`Error fetching rate for ${date}: ${response.statusText}`);
                continue;
            }

            const data = await response.json();

            if (data.success && data.historical === true) {
                rateResults.push({ date, rate: data.rates });
            } else {
                console.error(`No valid rate data for date ${date}:`, data.error || "Unknown issue");
            }
        }

        // Check if we successfully fetched rates
        if (rateResults.length === 0) {
            return res.status(500).json({ error: "Failed to fetch any historical rates. Please try again later." });
        }

        // Return the collected rates
        return res.status(200).json({
            base: from,
            target: to,
            start_date: startDate,
            end_date: endDate,
            rates: rateResults,
        });
    } catch (error) {
        console.error("Error fetching historical rates:", error);
        return res.status(500).json({ error: "An error occurred while fetching historical rates." });
    }
};

// Controller function to get transaction history for the past month - laven
const getTransactionHistoryPastMonth = async (req, res) => {
    const accNum = req.params.accNum; // Get account number from request params

    try {
        // Call the model method to fetch transaction history for the past month
        const transactions = await Transaction.getTransactionHistoryPastMonth(accNum);

        // Send response back to the client
        return res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching past month transaction history:", error);
        return res.status(500).json({ error: "An error occurred while retrieving transaction history for the past month." });
    }
};

module.exports = {
    getExpenses,
    getTransactionHistory,
    getRecipients, // (kesh)
    addRecipient, // (kesh)
    performTransfer, // (kesh)
    performForeignExchange, // (Sairam)
    convertCurrency, // (Sairam)
    getHistoricalRates, // (Sairam)
    getTransactionHistoryPastMonth // (laven)
};