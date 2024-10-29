const Account = require("../models/profile");
const bcrypt = require("bcrypt");   // Import bcrypt for password hashing
const jwt = require("jsonwebtoken");    // Import jsonwebtoken for creating tokens
require('dotenv').config(); // Import dotenv for environment variables

const getProfileById = async (req, res) => {
    const accountId = req.params.accountId;
    const account = await Account.getAccountById(accountId);

    if(account){
        res.json(account);
    }
    else{
        res.status(404).json({message: "Account not found."});
    }
}

const loginProfileByAccessCode = async (req, res) => {
    const accessCode = req.body.accessCode;
    const pin = req.body.pin;
    try{
        const profileData = await Account.getProfileByAccessCode(accessCode);

        if(!profileData){
            return res.status(404).json({message: "Account not found."});
        }

        // Check if the PIN is correct
        const isPinMatch = await bcrypt.compare(pin, profileData.PinHash);
        if(!isPinMatch){
            return res.status(401).json({message: "Invalid PIN."});
        }

        // Generate a JWT token
        const payload = {
            profileId: profileData.ProfileId
        };

        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "3600s"});  // 1 hour

        return res.json({token : token, profileId: profileData.ProfileId});        

    }
    catch(err){
        console.error("Error logging in user: ", err);
        res.status(500).json({message: "Error Authenticating user. Please try again later."});
    }
}

module.exports = {
    getProfileById,
    loginProfileByAccessCode,
};