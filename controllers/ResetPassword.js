const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const { sendResetPasswordEmail } = require("../utils/sendMailUser");

//reset password token
exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email missing.",
      });
    }

    const user = await User.findOne({ email: email });
    //no user found

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account for this email. Please sign up first.",
      });
    }

    //hashed token
    const token = crypto.randomBytes(20).toString("hex");

    const link = "https://petpathway.netlify.app/reset-password/" + token;

    //sending link to user
    await sendResetPasswordEmail(email, link);

    user.resetPasswordToken = token;
    user.resetPasswordTokenExpires = Date.now() + 5 * 60000;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `The reset password link has been sent to your ${email}.`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to send reset password link.",
      error: err.message,
    });
  }
};

//reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    const user = await User.findOne({ resetPasswordToken: token });
    //invlaid token
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    //expired token
    if (user.resetPasswordTokenExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token expired. Please regenerate a new one.",
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully.Please login",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: err.message,
    });
  }
};
