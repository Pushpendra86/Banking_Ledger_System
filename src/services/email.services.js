require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"backend  Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  try {
    const subject = "Welcome to Our Platform 🎉";
    const text = `Hi ${name}, Thank you for registering.`;
    const html = `<h2>Welcome ${name} 🎉</h2><p>Thank you for registering.</p>`;

    await sendEmail(userEmail, subject, text, html);
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
}

async function sendTransactionEmail(email, name, amount, toAccount) {
  try {
    const { email, name, amount, toAccount } = req.body;

    //validation
    if (!email || !name || !amount || !toAccount) {
      return res.status(400).json({ message: "all fields are required" });
    }

    const subject = "********************* Transaction Alert ************** 🎉";
    const text = `Hi ${name}, Here is your account balance.`;
    const html = `<h2>Bhai is account pr ${toAccount} 🎉</h2><p>isme rupey bheje hain tune ${amount}.</p>`;

    await sendEmail(userEmail, subject, text, html);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "error occured while sending email", err });
  }
}
module.exports = {
  transporter,
  sendEmail,
  sendRegistrationEmail,
  sendTransactionEmail,
};
