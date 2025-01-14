// Created By: Sairam (S10259930H)
const sql = require("mssql");
const dbConfig = require("../configs/dbConfig");

// BillID, BillerID, ProfileID, BillAmount, DueDate, Status
class Bill{
    constructor(BillID, BillerID, ProfileID, BillAmount, DueDate, Status, BillerName, Category, BillerAccNum) {
        this.BillID = BillID;
        this.BillerID = BillerID;
        this.ProfileID = ProfileID;
        this.BillAmount = BillAmount;
        this.DueDate = DueDate;
        this.Status = Status;
        this.BillerName = BillerName;
        this.Category = Category;
        this.BillerAccNum = BillerAccNum;
    }
    // Static method to fetch bill details of that are not paid nad sort by due date 
    static async getUnpaidBills(profileID) {
        const connection = await sql.connect(dbConfig); // Connect to the database
    
        try {
            // SQL query to get unpaid bills
            const sqlQuery = `
               SELECT 
                    Bills.BillID, 
                    Bills.BillerID, 
                    Bills.ProfileID, 
                    Bills.BillAmount, 
                    FORMAT(Bills.DueDate, 'dd MMMM yyyy') AS DueDate, 
                    Bills.Status, 
                    Biller.BillerName, 
                    Biller.Category
                FROM Bills
                INNER JOIN Biller ON Bills.BillerID = Biller.BillerID
                WHERE Bills.ProfileID = @ProfileID AND Bills.Status = 'Unpaid'
                ORDER BY Bills.DueDate ASC;
            `;

            const request = connection.request();
            request.input("ProfileID", sql.SmallInt, profileID); 
            const result = await request.query(sqlQuery);
            const rows = result.recordset;

            return rows.map(row => new Bill(
                row.BillID,
                row.BillerID,
                row.ProfileID,
                row.BillAmount,
                row.DueDate,
                row.Status,
                row.BillerName,
                row.Category
                
            ));

        } catch (error) {
            console.log('Error retrieving unpaid bills:', error);
            throw error;
        } finally {
            connection.close(); // Close the connection
        }
    }
    // Static method to fetch paid bills Sort by due date
    static async getPaidBills(profileID) {
        const connection = await sql.connect(dbConfig); // Connect to the database
    
        try {
            // SQL query to get paid bills
            const sqlQuery = `
               SELECT 
                    Bills.BillID, 
                    Bills.BillerID, 
                    Bills.ProfileID, 
                    Bills.BillAmount, 
                    FORMAT(Bills.DueDate, 'dd MMMM yyyy') AS DueDate, 
                    Bills.Status, 
                    Biller.BillerName, 
                    Biller.Category
                FROM Bills
                INNER JOIN Biller ON Bills.BillerID = Biller.BillerID
                WHERE Bills.ProfileID = @ProfileID AND Bills.Status = 'Paid'
                ORDER BY Bills.DueDate ASC;
            `;
            const request = connection.request();
            request.input("ProfileID", sql.SmallInt, profileID); 
            const result = await request.query(sqlQuery);
            const rows = result.recordset;

            return rows.map(row => new Bill(
                row.BillID,
                row.BillerID,
                row.ProfileID,
                row.BillAmount,
                row.DueDate,
                row.Status,
                row.BillerName,
                row.Category
            ));

        } catch (error) {
            console.log('Error retrieving paid bills:', error);
            throw error;
        } finally {
            connection.close(); // Close the connection
        }
    }
    // Static to fetch bill details by BillID
    static async getBillDetails(billID) {
        const connection = await sql.connect(dbConfig); // Connect to the database
    
        try {
            // SQL query to get bill details
            const sqlQuery = `
               SELECT 
                    Bills.BillID, 
                    Bills.BillerID, 
                    Bills.ProfileID, 
                    Bills.BillAmount, 
                    FORMAT(Bills.DueDate, 'dd MMMM yyyy') AS DueDate, 
                    Bills.Status, 
                    Biller.BillerName, 
                    Biller.Category,
                    Biller.BillerAccNum
                FROM Bills
                INNER JOIN Biller ON Bills.BillerID = Biller.BillerID
                WHERE Bills.BillID = @BillID;
            `;
            const request = connection.request();
            request.input("BillID", sql.Int, billID); 
            const result = await request.query(sqlQuery);
            const row = result.recordset[0];

            if (!row) {
                throw new Error("Bill not found.");
            }

            return new Bill(
                row.BillID,
                row.BillerID,
                row.ProfileID,
                row.BillAmount,
                row.DueDate,
                row.Status,
                row.BillerName,
                row.Category,
                row.BillerAccNum
            );

        } catch (error) {
            console.log('Error retrieving bill details:', error);
            throw error;
        } finally {
            connection.close(); // Close the connection
        }
    }
    // Static method to pay a bill and update the status to 'Paid'
    static async payBill(accSender, billID) {
        const connection = await sql.connect(dbConfig); // Connect to the database
        let transaction;
        try {
            transaction = new sql.Transaction(connection);
            await transaction.begin();
    
            // 1. Fetch the bill details and validate ProfileID
            const billDetailsQuery = `
                SELECT b.BillAmount, b.ProfileID, br.BillerAccNum
                FROM Bills b
                JOIN Biller br ON b.BillerID = br.BillerID
                WHERE b.BillID = @BillID AND b.Status = 'Unpaid'
            `;
            const billDetailsResult = await transaction.request()
                .input("BillID", sql.Int, billID)
                .query(billDetailsQuery);
    
            if (billDetailsResult.recordset.length === 0) {
                throw new Error("Bill not found or already paid.");
            }
    
            const { BillAmount: billAmount, ProfileID: billProfileID, BillerAccNum } = billDetailsResult.recordset[0];
    
            // 2. Fetch the sender's profile from the Account table
            const senderProfileQuery = `SELECT ProfileID, Balance FROM Account WHERE AccNum = @AccNum`;
            const senderProfileResult = await transaction.request()
                .input("AccNum", sql.VarChar(20), accSender)
                .query(senderProfileQuery);
    
            if (senderProfileResult.recordset.length === 0) {
                throw new Error("Sender account not found.");
            }
    
            const { ProfileID: senderProfileID, Balance: senderBalance } = senderProfileResult.recordset[0];
    
            // 3. Validate the sender is associated with the bill
            if (billProfileID !== senderProfileID) {
                throw new Error("You are not authorized to pay this bill.");
            }
    
            // 4. Check sender's balance
            if (senderBalance < billAmount) {
                throw new Error("Insufficient balance for transfer.");
            }
    
            // 5. Deduct the amount from the sender's account
            const deductAmountQuery = `UPDATE Account SET Balance = Balance - @Amount WHERE AccNum = @AccNum`;
            await transaction.request()
                .input("Amount", sql.Float, billAmount)
                .input("AccNum", sql.VarChar(20), accSender)
                .query(deductAmountQuery);
    
            // 6. Create a transaction record
            const transactionQuery = `
                INSERT INTO BankTransaction (TransactAmount, AccSender, BillerAccNum)
                VALUES (@Amount, @AccSender, @BillerAccNum)
            `;
            await transaction.request()
                .input("Amount", sql.Float, billAmount)
                .input("AccSender", sql.VarChar(20), accSender)
                .input("BillerAccNum", sql.VarChar(20), BillerAccNum)
                .query(transactionQuery);
    
            // 7. Update the bill status to 'Paid'
            const updateBillQuery = `UPDATE Bills SET Status = 'Paid' WHERE BillID = @BillID`;
            await transaction.request()
                .input("BillID", sql.Int, billID)
                .query(updateBillQuery);
    
            // Commit the transaction
            await transaction.commit();
    
            return { message: "Bill paid successfully." };
        } catch (error) {
            console.error("Error paying bill:", error);
            if (transaction) await transaction.rollback();
            throw error;
        } finally {
            connection.close(); // Close the connection
        }
    }
    
    
    
}
module.exports = Bill;