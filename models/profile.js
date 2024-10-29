const sql = require("mssql");
const dbConfig = require("../configs/dbConfig");

class Profile{
    constructor(ProfileId, FullName, AccessCode, PinHash){
        this.ProfileId = ProfileId;
        this.FullName = FullName;
        this.AccessCode = AccessCode;
        this.PinHash = PinHash;
    }

    static async getProfileById(){
        const connection = await sql.connect(dbConfig);

        try{
            const sqlQuery = `SELECT * FROM Profile WHERE ProfileId = @ProfileId`;

            const request = connection.request();
            request.input("ProfileId", sql.SmallInt, this.ProfileId);

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