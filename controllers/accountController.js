// Created By: Sairam (S10259930H)
const Account = require("../models/account");

// Controller function to fetch account details
const getAccountByProfileId = async (req, res) => {
    const profileId = parseInt(req.params.profileId); 
  
    try {
      const account = await Account.getAccountByProfileId(profileId); // Attempt to fetch account by ProfileId
  
      if (!account) {
        return res.status(404).send("Account not found"); // Handle case where no account is found
      }
  
      res.json(account);  // Return account details as JSON response
  
    } catch (error) {
      console.error("Error retrieving account:", error.message);
      res.status(500).send("Error retrieving account");  
    }
  };

module.exports = {
  getAccountByProfileId
};