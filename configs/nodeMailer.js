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

const sendUrl = async (email, hostRoomUrl, body) => {
  await transporter.sendMail({
    from: 'HelpLine@OCBC.com', // Sender address
    to: email, // Receiver address
    subject: 'Your Video Call Room is Ready',
    html: body
  });
};

const sendBudgetAlert = async (email, body) => {
  await transporter.sendMail({
    from: 'BudgetMonitoring@OCBC.com', // Sender address
    to: email, // Receiver address
    subject: 'Budget Alert',
    html: body
  });
}

module.exports = { 
  sendUrl,
  sendBudgetAlert
};
