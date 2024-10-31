// Created By: Sairam (S10259930H)
const sql = require("mssql");
const dbConfig = require("../configs/dbConfig");

class Card{
    constructor(CardNum, CardName,DateOfExpiry,CVV,AccNum){
        this.CardNum = CardNum;
        this.CardName = CardName;
        this.DateOfExpiry = DateOfExpiry;
        this.CVV = CVV;
        this.AccNum = AccNum;
    }
    // Static method to fetch profile id and accNum
    static async getCardtByProfileIdandAccNum(profileId, accNum) {
        const connection = await sql.connect(dbConfig); // Connect to the database
    
        try {
            // SQL query to  profile id and accNum
            const sqlQuery = `
                SELECT c.CardNum, c.CardName, c.DateOfExpiry, c.CVV
                FROM Card c
                INNER JOIN Account a ON c.AccNum = a.AccNum
                WHERE a.ProfileId = @ProfileId AND a.AccNum = @AccNum`;; // Parameterized query
                const request = connection.request();
                request.input("ProfileId", profileId);
                request.input("AccNum", accNum);
                const result = await request.query(sqlQuery);
                // Check if any records were found
                if (result.recordset.length === 0) {
                    return null; 
                }
                // Return the first card found
                const row = result.recordset[0];
                return new Card(row.CardNum, row.CardName, row.DateOfExpiry, row.CVV, accNum);
        }
        catch (error) {
            console.error("Error retrieving cards by profile ID and account number:", error);
            throw error;
        } finally {
            connection.close();
        }
    }

}

module.exports = Card;