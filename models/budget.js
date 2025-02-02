// Created By: Chang Guan Qaun (S10257825A)
const sql = require("mssql");
const dbConfig = require("../configs/dbConfig");

class Budget {
    constructor(BudgetId, BudgetAmount, BudgetCategory, AccNum) {
        this.BudgetId = BudgetId;
        this.BudgetAmount = BudgetAmount;
        this.BudgetCategory = BudgetCategory;
        this.AccNum = AccNum;
    }

    // Static method to fetch budget details by account number
    static async getBudgetByAccNum(accNum) {
        const connection = await sql.connect(dbConfig); // Connect to the database

        try {
            // SQL query to get budget by account number
            const sqlQuery = `SELECT * FROM Budget WHERE AccNum = @AccNum`; // Parameterized query
            const request = connection.request();
            request.input("AccNum", sql.VARCHAR(20), accNum);

            const result = await request.query(sqlQuery);
            const budget = result.recordset.map(row => {
                return new Budget(
                    row.BudgetId,
                    row.BudgetAmount,
                    row.BudgetCategory,
                    row.AccNum
                );
            });

            return budget;

        } catch (error) {
            console.log('Error retrieving budget by account number:', error);
            throw error;
        } finally {
            connection.close(); // Close the connection
        }
    }

    // Static method to update or create budget for specific category details by account number
    static async updateBudgetByAccNum(budgetAmount, budgetCategory, accNum) {
        const connection = await sql.connect(dbConfig); // Connect to the database
        // If budget amount is 0, delete the budget
        try {
            // SQL query to update or create budget by account number
            let sqlQuery = `IF EXISTS (SELECT * FROM Budget WHERE AccNum = @AccNum AND BudgetCategory = @BudgetCategory)
                              BEGIN
                                  UPDATE Budget SET BudgetAmount = @BudgetAmount
                                  WHERE AccNum = @AccNum AND BudgetCategory = @BudgetCategory
                              END
                              ELSE
                              BEGIN
                                  INSERT INTO Budget (BudgetAmount, BudgetCategory, AccNum)
                                  VALUES (@BudgetAmount, @BudgetCategory, @AccNum)
                              END`;

            if (budgetAmount === 0) {
                // SQL query to delete budget by account number and category
                sqlQuery = `DELETE FROM Budget WHERE AccNum = @AccNum AND BudgetCategory = @BudgetCategory`; // Parameterized query
            }
            const request = connection.request();
            request.input("BudgetAmount", sql.FLOAT, budgetAmount);
            request.input("BudgetCategory", sql.NVARCHAR(255), budgetCategory);
            request.input("AccNum", sql.VARCHAR(20), accNum);

            await request.query(sqlQuery);

        } catch (error) {
            console.log('Error updating or creating budget by account number:', error);
            throw error;
        } finally {
            connection.close(); // Close the connection
        }
    }
}

module.exports = Budget;