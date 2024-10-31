// Created By: Sairam (S10259930H)
const sql = require("mssql");
const dbConfig = require("../configs/dbConfig");

class Transaction {
    constructor(TransactNo, TransactDate, TransactAmount, AccSender, SenderName, AccReceiver, ReceiverName) {
        this.TransactNo = TransactNo;
        this.TransactDate = TransactDate;
        this.TransactAmount = TransactAmount;
        this.AccSender = AccSender;
        this.SenderName = SenderName;
        this.AccReceiver = AccReceiver;
        this.ReceiverName = ReceiverName;
    }

    // Static method to fetch transaction history based on account number and time range
    static async getTransactionHistory(accNum, rangeOption, startDate, endDate) {
        const connection = await sql.connect(dbConfig); // Connect to the database

        try {
            let calculatedStartDate;
            let calculatedEndDate = new Date(); // Set to today's date

            // Calculate start date based on range option
            if (rangeOption === '1month') {
                calculatedStartDate = new Date();
                calculatedStartDate.setMonth(calculatedStartDate.getMonth() - 1);
            } else if (rangeOption === '3months') {
                calculatedStartDate = new Date();
                calculatedStartDate.setMonth(calculatedStartDate.getMonth() - 3);
            } else if (rangeOption === 'custom') {
                if (!startDate || !endDate) {
                    throw new Error('Start date and end date are required for a custom range.');
                }
                calculatedStartDate = new Date(startDate);
                calculatedEndDate = new Date(endDate);
            } else {
                throw new Error('Invalid range option.');
            }

            // SQL query to fetch transactions based on account number and calculated date range
            const sqlQuery = `
            SELECT 
                bt.TransactNo, 
                FORMAT(bt.TransactDate, 'dd MMMM yyyy') AS TransactDate,
                bt.TransactAmount, 
                bt.AccSender, 
                senderProfile.FullName AS SenderName, 
                bt.AccReceiver, 
                receiverProfile.FullName AS ReceiverName
            FROM BankTransaction bt
            INNER JOIN Account sender ON bt.AccSender = sender.AccNum
            INNER JOIN Profile senderProfile ON sender.ProfileId = senderProfile.ProfileId
            INNER JOIN Account receiver ON bt.AccReceiver = receiver.AccNum
            INNER JOIN Profile receiverProfile ON receiver.ProfileId = receiverProfile.ProfileId
            WHERE (bt.AccSender = @AccNum OR bt.AccReceiver = @AccNum)
            AND bt.TransactDate BETWEEN @StartDate AND @EndDate
            ORDER BY bt.TransactDate DESC`; // Parameterized query

            const request = connection.request();
            request.input("AccNum", accNum);
            request.input("StartDate", calculatedStartDate);
            request.input("EndDate", calculatedEndDate);

            const result = await request.query(sqlQuery);

            // Check if any records were found
            if (result.recordset.length === 0) {
                return [];
            }

            // Map the results to Transaction objects
            const transactions = result.recordset.map(row => new Transaction(
                row.TransactNo,
                row.TransactDate,
                row.TransactAmount,
                row.AccSender,
                row.AccSender === accNum ? "You" : row.SenderName,
                row.AccReceiver,
                row.AccReceiver === accNum ? "You" : row.ReceiverName
            ));

            return transactions; // Return the array of Transaction objects
        } catch (error) {
            console.error("Error retrieving transaction history:", error);
            throw error;
        } finally {
            connection.close();
        }
    }
}

module.exports = Transaction;
