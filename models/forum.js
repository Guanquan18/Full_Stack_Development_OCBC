// [Created by Keshwindren : S10259469C]

const sql = require("mssql"); //import MSSQL 
const dbConfig = require("../configs/dbConfig"); //import database configuration

//fetch all forum categories
async function getCategories() {
    try {
        const pool = await sql.connect(dbConfig); //connect to database
        const result = await pool.request().query(`
            SELECT CategoryID, CategoryName FROM ForumCategory;
        `); //fetch all categories
        return result.recordset; //return result set
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Database error while fetching categories.");
    }
}

//fetch all messages for a specific category
async function getMessagesByCategory(categoryId) {
    try {
        const pool = await sql.connect(dbConfig); //connect to the database
        const result = await pool.request()
            .input("CategoryID", sql.Int, categoryId) //bind the category ID
            .query(`
                SELECT MessageID, SenderName, MessageContent, FORMAT(PostedDate, 'dd/MM/yyyy, HH:mm') AS PostedTime
                FROM ForumMessages WHERE CategoryID = @CategoryID;
            `); //fetch messages for the category
        return result.recordset; //return result set
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Database error while fetching messages.");
    }
}

//insert new message into forum
async function postMessage(categoryId, senderName, messageContent) {
    try {
        const pool = await sql.connect(dbConfig); //connect to database
        const result = await pool.request()
            .input("CategoryID", sql.Int, categoryId) //bind category ID
            .input("SenderName", sql.NVarChar, senderName) //bind sender's name (Bob Johnson in this demo)
            .input("MessageContent", sql.NVarChar, messageContent) //bind the message content
            .query(`
                INSERT INTO ForumMessages (CategoryID, SenderName, MessageContent)
                VALUES (@CategoryID, @SenderName, @MessageContent);
            `); //insert new message
        return { success: true, insertedRows: result.rowsAffected[0] }; //return success status
    } catch (error) {
        console.error("Error posting message:", error);
        throw new Error("Database error while posting message.");
    }
}

async function getMessageCounts() {
    try {
        const pool = await sql.connect(dbConfig); //connect to database
        const result = await pool.request().query(`
            SELECT 
                FC.CategoryName,
                COUNT(FM.MessageID) AS MessageCount
            FROM ForumCategory FC
            LEFT JOIN ForumMessages FM ON FC.CategoryID = FM.CategoryID
            GROUP BY FC.CategoryName;
        `); //count messages per category

        return result.recordset; //return data in JSON format
    } catch (error) {
        console.error("Error fetching message counts:", error);
        throw new Error("Database error while fetching message counts.");
    }
}

//delete a message by ID
async function deleteMessage(messageId) {
    try {
        const pool = await sql.connect(dbConfig); //connect to database
        const result = await pool.request()
            .input("MessageID", sql.Int, messageId)
            .query("DELETE FROM ForumMessages WHERE MessageID = @MessageID");

        return { success: result.rowsAffected[0] > 0 }; //return success if row was deleted
    } catch (error) {
        console.error("Error deleting message:", error);
        throw new Error("Database error while deleting message.");
    }
}



//export all model methods
module.exports = {
    getCategories,
    getMessagesByCategory,
    postMessage,
    getMessageCounts,
    deleteMessage
};
