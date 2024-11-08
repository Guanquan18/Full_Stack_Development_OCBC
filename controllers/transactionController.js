// Created By: Sairam (S10259930H)
const Transaction = require("../models/transaction"); // Adjust the path as needed

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

        if (result.error) {
            // Check the error message to set the appropriate status code
            if (result.error === "Recipient already exists with this profile and account number.") {
                return res.status(400).json({ error: result.error }); // Bad request for existing recipient
            } else if (result.error === "The specified account number does not exist.") {
                return res.status(404).json({ error: result.error }); // Not found for non-existent account number
            }
        }

        res.status(201).json(result); // Success response when recipient is added
    } catch (error) {
        console.error("Error adding recipient:", error);
        res.status(500).json({ error: "An error occurred while adding the recipient." });
    }
};



// Performing a transfer to the recipient (kesh)
const performTransfer = async (req, res) => {
    const { accSender, accReceiver, amount } = req.body;
    try {
        const result = await Transaction.performTransfer(accSender, accReceiver, amount);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error performing transfer:", error);
        res.status(500).json({ error: "An error occurred while performing the transfer." });
    }
};

module.exports = {
    getTransactionHistory,
    getRecipients, // (kesh)
    addRecipient, // (kesh)
    performTransfer // (kesh)
};