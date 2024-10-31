// Created By: Sairam (S10259930H) & Chang Guan Qaun (S10257825A)
const sql = require("mssql");
const dbConfig = require("../configs/dbConfig");

class Profile{
    constructor(ProfileId, FullName, AccessCode, PinHash){
        this.ProfileId = ProfileId;
        this.FullName = FullName;
        this.AccessCode = AccessCode;
        this.PinHash = PinHash;
    }
    // Static method to fetch profile details
    static async getProfileById(profileId){
        const connection = await sql.connect(dbConfig);

        try{
            // SQL query to get profile by profileid
            const sqlQuery = `SELECT * FROM Profile WHERE ProfileId = @ProfileId`; // Parameterized query
            const request = connection.request();
            request.input("ProfileId", sql.SmallInt, profileId);
            const result = await request.query(sqlQuery);
            const row = result.recordset[0];

            return row
                ? new Profile(
                    row.ProfileId,
                    row.FullName,
                    row.AccessCode,
                    row.PinHash
                )
                : null;
        }
        catch (error) {
            console.log('Error retrieving profile by profile ID:', error);
            throw error;
        } finally {
            connection.close(); // Close the connection
        }
    }

    static async getProfileByAccessCode(AccessCode){
        const connection = await sql.connect(dbConfig);

        try{
            const sqlQuery = `SELECT * FROM Profile WHERE AccessCode = @AccessCode`;

            const request = connection.request();
            request.input("AccessCode", sql.Char(7), AccessCode);

            const result = await request.query(sqlQuery);
            const row = result.recordset[0];

            return row
                ? new Profile(
                    row.ProfileId,
                    row.FullName,
                    row.AccessCode,
                    row.PinHash
                )
                : null;
        }
        catch(err){
            console.error("SQL error: ", err);
        }
        finally{
            connection.close();
        }
    }
}

module.exports = Profile;