// Import Chatbot model to chatbotController.js
const chatbot = require("../models/chatbot");

// Controller to get a response from the chatbot
const getChatbotResponse = async (req, res) => {
    const userMessage = req.body; // Extract user message from request body
    try {
      const response = await chatbot.getResponse(userMessage); // Retrieve chatbot response based on user message
      res.json({ response }); // Send the chatbot response as JSON
    } catch (error) {
      console.error(error); // Log errors occurred in console
      res.status(500).send("Error retrieving response from chatbot"); // Respond with status code 500 (Internal Server Error)
    }
};
  
  // Export the controller from chatbotController.js
  module.exports = {
    getChatbotResponse
};