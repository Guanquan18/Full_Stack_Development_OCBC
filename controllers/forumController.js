// [Created by Keshwindren : S10259469C]

const Forum = require("../models/forum"); 

//fetch forum categories
const getCategories = async (req, res) => {
    try {
        const categories = await Forum.getCategories(); // Call the model method
        return res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ error: "An error occurred while retrieving categories." });
    }
};

//fetch messages for chosen specific category
const getMessagesByCategory = async (req, res) => {
    const categoryId = req.params.categoryId; // Extract category ID from URL
    try {
        const messages = await Forum.getMessagesByCategory(categoryId); // Call the model method
        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "An error occurred while retrieving messages." });
    }
};

//add new message
const postMessage = async (req, res) => {
    const { categoryId, senderName, messageContent } = req.body; // Extract data from request body
    try {
        const result = await Forum.postMessage(categoryId, senderName, messageContent); // Call the model method
        return res.status(201).json({ message: "Message posted successfully", result });
    } catch (error) {
        console.error("Error posting message:", error);
        return res.status(500).json({ error: "An error occurred while posting the message." });
    }
};

//export controller functions
module.exports = {
    getCategories,
    getMessagesByCategory,
    postMessage
};
