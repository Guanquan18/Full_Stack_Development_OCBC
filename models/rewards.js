// Created By: Chang Guan Qaun (S10257825A)
const sql = require("mssql");
const dbConfig = require("../configs/dbConfig");

class Rewards{
    constructor(RewardsHistoryId, RewardDescription, RewardType, RewardAmount, RewardDate, AccNum){
        this.RewardsHistoryId = RewardsHistoryId;
        this.RewardDescription = RewardDescription;
        this.RewardType = RewardType;
        this.RewardAmount = RewardAmount;
        this.RewardDate = RewardDate;
        this.AccNum = AccNum;
    }
    // Static method to fetch rewards details by account number
    static async getRewardsByProfileId(profileId) {
        const connection = await sql.connect(dbConfig); // Connect to the database
    
        try {
            // SQL query to get rewards by account number
            const sqlQuery = `SELECT r.* FROM RewardsHistory r
                              INNER JOIN Account a on r.AccNum = a.AccNum
                              INNER JOIN Profile p on a.ProfileId = p.ProfileId
                              WHERE p.ProfileId = @ProfileId`; // Parameterized query
            const request = connection.request();
            request.input("ProfileId", sql.Int, profileId); 
            
            const result = await request.query(sqlQuery);
            const rewardsHistory = result.recordset.map(row => {
                return new Rewards(
                    row.RewardsHistoryId,
                    row.RewardDescription,
                    row.RewardType,
                    row.RewardAmount,
                    row.RewardDate,
                    row.AccNum
                );
            });

            return rewardsHistory;

        } catch (error) {
            console.log('Error retrieving rewards by account number:', error);
            throw error;
        } finally {
            connection.close(); // Close the connection
        }
    }

    static async claimRewards(rewardDescription, rewardType, rewardAmount, accNum) {
        const connection = await sql.connect(dbConfig); // Connect to the database
    
        try {
            // SQL query to insert rewards into the RewardsHistory table
            const sqlQuery = `INSERT INTO RewardsHistory (RewardDescription, RewardType, RewardAmount, AccNum)
                              VALUES (@RewardDescription, @RewardType, @RewardAmount, @AccNum)`;
            const request = connection.request();
            request.input("RewardDescription", sql.NVARCHAR(255), rewardDescription);
            request.input("RewardType", sql.NVARCHAR(255), rewardType);
            request.input("RewardAmount", sql.FLOAT, rewardAmount);
            request.input("AccNum", sql.VARCHAR(20), accNum);
            
            const result = await request.query(sqlQuery);
            return result.rowsAffected; // Return the number of rows affected

        } catch (error) {
            console.log('Error claiming rewards:', error);
            throw error;
        } finally {
            connection.close(); // Close the connection
        }
    }
}

module.exports = Rewards;