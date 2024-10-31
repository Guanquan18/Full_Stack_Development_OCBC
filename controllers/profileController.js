const Profile = require("../models/profile");
const bcrypt = require("bcrypt");   // Import bcrypt for password hashing
const jwt = require("jsonwebtoken");    // Import jsonwebtoken for creating tokens
require('dotenv').config(); // Import dotenv for environment variables

const getProfileById = async (req, res) => {
    const profileId = parseInt(req.params.profileId); 
  
    try {
      const profile = await Profile.getProfileById(profileId); // Attempt to fetch profile by ProfileId
  
      if (!profile) {
        return res.status(404).send("Profile not found"); // Handle case where no profile is found
      }
  
      res.json(profile);  // Return account details as JSON response
  
    } catch (error) {
      console.error("Error retrieving profile", error.message);
      res.status(500).send("Error retrieving profile");  
    }
}

const loginProfileByAccessCode = async (req, res) => {
    const accessCode = req.body.accessCode;
    const pin = req.body.pin;
    try{
        const profileData = await Profile.getProfileByAccessCode(accessCode);

        if(!profileData){
            return res.status(404).json({message: "Profile not found."});
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