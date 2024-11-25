const nodemailer = require("nodemailer");
require("dotenv").config();

//todo : create templates

//transporter
const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST,
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

//send otp to user for email verification
exports.sendVerificationEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: "Pet Pathway",
      to: email, // list of receivers
      subject: "Email Verification OTP", // Subject line
      text: "", // plain text body
      html: `<h1>Welcome to PetPathway</h1><br/>
             <p>otp : ${otp}</p><br/>
             <p>OTP vaild for next 5 minutes</p>`, // html body
    });
    console.log("Mail sent successfully");
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: err.message,
    });
  }
};

//send reset password link to user
exports.sendResetPasswordEmail = async (email, link) => {
  try {
    const info = await transporter.sendMail({
      from: "Pet Pathway",
      to: email, // list of receivers
      subject: "Reset Password", // Subject line
      text: "", // plain text body
      html: `<h1>Reset Password Link</h1><br/>
            <p>Click on this link to reset your password.: ${link}</p>
            <br/><p>Link vaild for next 5 minutes</p>`, // html body
    });
    console.log("Mail sent successfully");
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: err.message,
    });
  }
};
