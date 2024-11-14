const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io', // Mailtrap SMTP server
  port: 2525, // Port number
  auth: {
    user: process.env.YOUR_MAILTRAP_USERNAME, // Mailtrap SMTP username
    pass: process.env.YOUR_MAILTRAP_PASSWORD  // Mailtrap SMTP password
  }
});

const sendUrl = async (email, hostRoomUrl) => {
  await transporter.sendMail({
    from: 'HelpLine@gmail.com', // Sender address
    to: email, // Receiver address
    subject: 'Your Video Call Room is Ready',
    html: `
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
    `
  });
};

module.exports = { sendUrl };
