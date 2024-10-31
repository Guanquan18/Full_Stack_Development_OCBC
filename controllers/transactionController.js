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

module.exports = {
    getTransactionHistory
};
