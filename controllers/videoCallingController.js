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

        res.status(200).json(data);
    } catch (error) {
        console.log('Error creating Whereby room:', error);
        res.status(500).json({ message: 'Unable to create room' });
    }
}

// Handle password reset request
const sendUrl = async (req, res) => {
  try{
    const email = 'Staff@gmail.com'; // Get the email from the user object
    const hostRoomUrl = req.body.data.hostRoomUrl; // Get the host room URL from the request body
    const body = `
      <div style="font-family: Arial, sans-serif; font-size: 16px;">
        <h2 style="color: #ED3F3F;">OCBC Help Line Admin Notification</h2>
        <p>Dear Admin,</p>
        <p>A new host room has been successfully created for an upcoming customer support video call.</p>
        <p>You can access the host room using the link below:</p>
        <p><a href="${hostRoomUrl}" style="color: #ED3F3F; text-decoration: none;">Access the Host Room</a></p>
        <p>Please ensure the room is managed effectively for the customer's assistance.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>OCBC HelpLine System</strong></p>
      </div>
    `;
    await nodeMailer.sendUrl(email, hostRoomUrl, body); // Send the OTP email
    res.status(200)
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
