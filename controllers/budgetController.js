const Budget = require('../models/budget');
const nodeMailer = require('../configs/nodeMailer.js');

const getBudgetByAccNum = async (req, res) => {
    const accNum = req.params.accNum;
    try {
        const budget = await Budget.getBudgetByAccNum(accNum);
        return res.status(200).json(budget);
    } catch (error) {
        console.error("Error fetching budget:", error);
        return res.status(500).json({ error: "An error occurred while retrieving budget." });
    }
};

const updateBudgetByAccNum = async (req, res) => {
    const accNum = req.params.accNum;
    const { budgetAmount, budgetCategory} = req.body;

    try {
        const result = await Budget.updateBudgetByAccNum(budgetAmount, budgetCategory, accNum);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error updating budget:", error);
        return res.status(500).json({ error: "An error occurred while updating budget." });
    }
};

const sendBudgetAlert = async (req, res) => {
    const email = 'example@gmail.com';
    const category = req.body.category;
    const amountSpent = req.body.amountSpent;
    const budgetLimit = req.body.budgetLimit;
    console.log("Sending budget alert for category:", category);
    const body = `
        <div style="font-family: Arial, sans-serif; font-size: 16px;">
            <h2 style="color: #ED3F3F;">OCBC Budget Alert</h2>
            <p>Dear Customer,</p>
            <p>Your budget for ${category} has exceeded the set limit.</p>
            <p>Spent: <strong>${amountSpent}</strong></p>
            <p>Budget Limit: <strong>${budgetLimit}</strong></p>
            <br>
            <p>Please review your expenses and adjust your ${category} budget accordingly.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>OCBC Budget Monitoring System</strong></p>
        </div>
    `;
    try {
        await nodeMailer.sendBudgetAlert(email, body);
        return res.status(200).json({ message: "Budget alert sent successfully" });
    } catch (error) {
        console.error("Error sending budget alert:", error);
        return res.status(500).json({ error: "An error occurred while sending budget alert." });
    }
}

module.exports = { 
    getBudgetByAccNum,
    updateBudgetByAccNum,
    sendBudgetAlert
};