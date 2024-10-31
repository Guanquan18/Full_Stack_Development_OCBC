// Created By: Sairam (S10259930H)
const Card = require("../models/card");

// Controller function to card details
const getCardtByProfileIdandAccNum = async (req, res) => {
    const profileId = parseInt(req.params.profileId);
    const accNum = req.params.accNum;
    try {
      const card = await Card.getCardtByProfileIdandAccNum(profileId,accNum); // Attempt to fetch card by ProfileId and accNum
  
      if (!card) {
        return res.status(404).send("Card not found"); // Handle case where no account is found
      }
  
      res.json(card);  // Return card details as JSON response
  
    } catch (error) {
      console.error("Error retrieving card:", error.message);
      res.status(500).send("Error retrieving card");  
    }
  };

module.exports = {
  getCardtByProfileIdandAccNum
};