const mongoose = require("mongoose");

const { sendVerificationEmail } = require("../utils/sendMailUser");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
    maxLength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // 600 seconds = 10 minutes
  },
});

//send mail before saving new data
otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

module.exports = mongoose.model("OTP", otpSchema);
