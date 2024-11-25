const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxLength: 15,
    },
    lastName: {
      type: String,
      required: true,
      maxLength: 15,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    profile_image: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["admin", "user"],
    },
    location: {
      type: String,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpires: {
      type: Date,
    },
    myBlogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
