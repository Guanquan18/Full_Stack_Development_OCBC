const nodeMailer = require('../configs/nodeMailer.js');
require('dotenv').config();

const createRoom = async (req, res, next) => {
    try {
        const response = await fetch('https://api.whereby.dev/v1/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.WHEREBY_API_KEY}`
          },
          body: JSON.stringify({
            "isLocked": false,
            "roomNamePrefix": "",
            "roomNamePattern": "uuid",
            "roomMode": "normal",
            "endDate": new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30 minutes from now
            "fields": ["hostRoomUrl"]
          })
        });
        const data = await response.json();
        console.log('Whereby room created:', data);

        req.body.data = data; // Set the room URL in the request body
        next();

    } catch (error) {
        console.log('Error creating Whereby room:', error);
        res.status(500).json({ message: 'Unable to create room' });
    }
}

// Handle password reset request
const sendUrl = async (req, res) => {
  try{
    const email = 'Staff@gmail.com'; // Get the email from the user object
    const roomUrl = req.body.data.roomUrl; // Get the room URL from the request body
    const hostRoomUrl = req.body.data.hostRoomUrl; // Get the host room URL from the request body
    
    await nodeMailer.sendUrl(email, hostRoomUrl); // Send the OTP email

    res.status(200).json(roomUrl)
  }catch(error){
    await fetch('https://api.whereby.dev/v1/meetings', { method: 'DELETE'});  // Delete the room if an error occurs

    console.log(error);
    res.status(500).json({ message: 'Error sending email' }); // Error sending
  }
};

module.exports = {
    createRoom,
    sendUrl,
};
