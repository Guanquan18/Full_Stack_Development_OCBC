// [Created by Keshwindren : S10259469C]

const sql = require("mssql"); // Import MSSQL module
const dbConfig = require("../configs/dbConfig"); // Import database configuration

// Fetch all forum categories
async function getCategories() {
    try {
        const pool = await sql.connect(dbConfig); // Connect to the database
        const result = await pool.request().query(`
            SELECT CategoryID, CategoryName FROM ForumCategory;
        `); // Query to fetch all categories
        return result.recordset; // Return the result set
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Database error while fetching categories.");
    }
}

// Fetch all messages for a specific category
async function getMessagesByCategory(categoryId) {
    try {
        const pool = await sql.connect(dbConfig); // Connect to the database
        const result = await pool.request()
            .input("CategoryID", sql.Int, categoryId) // Bind the category ID
            .query(`
                SELECT MessageID, SenderName, MessageContent, FORMAT(PostedDate, 'dd/MM/yyyy, HH:mm') AS PostedTime
                FROM ForumMessages WHERE CategoryID = @CategoryID;
            `); // Query to fetch messages for the category
        return result.recordset; // Return the result set
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Database error while fetching messages.");
    }
}

// Insert a new message into the forum
async function postMessage(categoryId, senderName, messageContent) {
    try {
        const pool = await sql.connect(dbConfig); // Connect to the database
        const result = await pool.request()
            .input("CategoryID", sql.Int, categoryId) // Bind the category ID
            .input("SenderName", sql.NVarChar, senderName) // Bind the sender's name
            .input("MessageContent", sql.NVarChar, messageContent) // Bind the message content
            .query(`
                INSERT INTO ForumMessages (CategoryID, SenderName, MessageContent)
                VALUES (@CategoryID, @SenderName, @MessageContent);
            `); // Query to insert a new message
        return { success: true, insertedRows: result.rowsAffected[0] }; // Return success status
    } catch (error) {
        console.error("Error posting message:", error);
        throw new Error("Database error while posting message.");
    }
}

async function getMessageCounts() {
    try {
        const pool = await sql.connect(dbConfig); // Connect to database
        const result = await pool.request().query(`
            SELECT 
                FC.CategoryName,
                COUNT(FM.MessageID) AS MessageCount
            FROM ForumCategory FC
            LEFT JOIN ForumMessages FM ON FC.CategoryID = FM.CategoryID
            GROUP BY FC.CategoryName;
        `); // Query to count messages per category

        return result.recordset; // Return data in JSON format
    } catch (error) {
        console.error("Error fetching message counts:", error);
        throw new Error("Database error while fetching message counts.");
    }
}

//delete a message by ID
async function deleteMessage(messageId) {
    try {
        const pool = await sql.connect(dbConfig); // Connect to the database
        const result = await pool.request()
            .input("MessageID", sql.Int, messageId)
            .query("DELETE FROM ForumMessages WHERE MessageID = @MessageID");

        return { success: result.rowsAffected[0] > 0 }; // Return success if at least one row was deleted
    } catch (error) {
        console.error("Error deleting message:", error);
        throw new Error("Database error while deleting message.");
    }
}



// Export all model methods
module.exports = {
    getCategories,
    getMessagesByCategory,
    postMessage,
    getMessageCounts,
    deleteMessage
};
