// Created By: Sairam (S10259930H)
const Bill = require("../models/bill");
// Controller function to fetch unpaid bills
const getUnpaidBills = async (req, res) => {
    const profileID = parseInt(req.params.profileId); // Parse the profileId from the request parameters
  
    try {
      const bills = await Bill.getUnpaidBills(profileID); // Attempt to fetch unpaid bills by ProfileId
  
      if (bills.length === 0) {
        return res.status(404).send("No unpaid bills found"); // Handle case where no unpaid bills are found
      }
  
      res.json(bills);  // Return unpaid bills as JSON response
  
    } catch (error) {
      console.error("Error retrieving unpaid bills:", error.message);
      res.status(500).send("Error retrieving unpaid bills");  
    }
  };

  // Controller function to fetch paid bills
const getPaidBills = async (req, res) => {
    const profileID = parseInt(req.params.profileId); // Parse the profileId from the request parameters
  
    try {
      const bills = await Bill.getPaidBills(profileID); // Attempt to fetch paid bills by ProfileId
  
      if (bills.length === 0) {
        return res.status(404).send("No paid bills found"); // Handle case where no paid bills are found
      }
  
      res.json(bills);  // Return paid bills as JSON response
  
    } catch (error) {
      console.error("Error retrieving paid bills:", error.message);
      res.status(500).send("Error retrieving paid bills");  
    }
  };
//Controller function to get bills by billId
const getBillById = async (req, res) => {
    const billID = parseInt(req.params.billID); // Parse the billID from the request parameters
  
    try {
      const bill = await Bill.getBillDetails(billID); // Attempt to fetch bill by billID
  
      if (!bill) {
        return res.status(404).send("Bill not found"); // Handle case where bill is not found
      }
  
      res.json(bill);  // Return bill as JSON response
  
    } catch (error) {
      console.error("Error retrieving bill:", error.message);
      res.status(500).send("Error retrieving bill");  
    }
  };

 // Controller function to handle bill payment
const payBills = async (req, res) => {
    const billID = parseInt(req.params.billID); // Parse the billID from request parameters

    try {
        // Extract only accSender from the request body
        const { accSender } = req.body;

        // Call the model method to process the payment
        const result = await Bill.payBill(accSender, billID);

        // Send a success response with the result
        res.status(200).json(result);

    } catch (error) {
        // Catch any error thrown in the model and send it to Postman
        console.error("Error paying bill:", error.message);
        res.status(400).json({ error: error.message });
    }
};



  
  module.exports = {
    getUnpaidBills,
    getPaidBills,
    payBills,
    getBillById
  };