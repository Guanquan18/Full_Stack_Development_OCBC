// Created By: Sairam (S10259930H)
const sql = require("mssql");
const dbConfig = require("../configs/dbConfig");

class Account{
    constructor(AccNum, Balance,ProfileId,AccType){
        this.AccNum = AccNum;
        this.AccType = AccType
        this.Balance = Balance;
        this.ProfileId = ProfileId;
    }
    // Static method to fetch account details
    static async getAccountByProfileId(profileId) {
        const connection = await sql.connect(dbConfig); // Connect to the database
    
        try {
            // SQL query to get accounts by profileid
            const sqlQuery = `SELECT * FROM Account WHERE ProfileId = @ProfileId`; // Parameterized query
            const request = connection.request();
            request.input("ProfileId", sql.SmallInt, profileId); 
            const result = await request.query(sqlQuery);
            const row = result.recordset[0];

            return row
                ? new Account(
                    row.AccNum,
                    row.Balance,
                    row.ProfileId,
                    row.AccType,
                )
                : null;

        } catch (error) {
            console.log('Error retrieving account by profile ID:', error);
            throw error;
        } finally {
            connection.close(); // Close the connection
        }
    }

}

module.exports = Account;