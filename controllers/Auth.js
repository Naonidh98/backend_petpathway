const OTP = require("../models/OTP");
const User = require("../models/User");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

//send otp to user
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    //validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email missing",
      });
    }

    //check email already registered or not
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(500).json({
        success: false,
        message: "Email is already in use. Please log in.",
      });
    }

    let newOtp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });

    // check for unique otp
    const result = await OTP.findOne({ otp: newOtp });

    while (result) {
      newOtp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true,
      });
    }

    //save OTP To DB
    await OTP.create({
      email: email,
      otp: newOtp,
    });

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to your email : ${email}`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: err.message,
    });
  }
};

//sign up
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, type, otp } = req.body;

    if (!firstName || !lastName || !email || !password || !type || !otp) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements.",
      });
    }

    //email already in use
    const exUser = await User.findOne({ email: email });
    if (exUser) {
      return res.status(500).json({
        success: false,
        message: "Email already registered.",
      });
    }

    //find all otps to this email
    const allOtps = await OTP.find({ email: email }).sort({
      createdAt: -1,
    });

    //No OTP found
    if (allOtps.length == 0) {
      return res.status(404).json({
        success: false,
        message: "Regenerate a new OTP.",
      });
    }

    //valid
    if (allOtps[0].otp === otp) {
      //hashed password
      const hashedPassword = await bcrypt.hash(password, 10);

      //user profile
      const profile = await Profile.create({
        description: null,
        dob: null,
        about: null,
        contact_no: null,
      });

      //new user created in DB
      const user = await User.create({
        firstName,
        lastName,
        password: hashedPassword,
        email,
        type : "user",
        profileId: profile._id,
        profile_image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
      });

      user.password = null;

      return res.status(200).json({
        success: true,
        message: "User created successfully.",
        data: user,
      });
    }

    //invalid OTP
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Sign-up failed.",
      error: err.message,
    });
  }
};  

//login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements.",
      });
    }

    //email already in use
    const exUser = await User.findOne({ email: email });
    if (!exUser) {
      return res.status(500).json({
        success: false,
        message: "Email not registered. Please sign up first.",
      });
    }

    //password valid
    if (await bcrypt.compare(password, exUser.password)) {
      const user = await User.findOne({ email: email }).populate("profileId");
      user.password = null;

      //jwt token
      const data = {
        _id: user._id,
        email: user.email,
        type: user.type,
      };

      const token = jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.cookie("token", token, options).status(200).json({
        success: true,
        user,
        token,
        message: "User logged in",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: err.message,
    });
  }
};

//update password when logged in
exports.updatePassword = async (req, res) => {
  try {
    const { email } = req.user;
    const { newPassword, confirmPassword, oldPassword } = req.body;

    //validation
    if (!email || !newPassword || !confirmPassword || !oldPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements.",
      });
    }

    if (confirmPassword !== newPassword) {
      return res.status(403).json({
        success: false,
        message: "Confirm password and new password do not match.",
      });
    }

    const user = await User.findOne({
      email: email,
    });

    if (await bcrypt.compare(oldPassword, user.password)) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      //update password
      await User.findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          password: hashedPassword,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Password updated successfully.",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Password is incorrect.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Password update failed.",
      error: err.message,
    });
  }
};
