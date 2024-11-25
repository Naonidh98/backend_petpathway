const Profile = require("../models/Profile");
const User = require("../models/User");

const {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} = require("../utils/uploadMedia");

require("dotenv").config();

exports.updateProfile = async (req, res) => {
  try {
    const {
      about = "",
      description = "",
      dob = "",
      contact_no = "",
    } = req.body;

    const { email, _id } = req.user;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is missing.",
      });
    }

    const user = await User.findOne({
      email: email,
    });

    //in valid email
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email is not registered.",
      });
    }

    //find profile
    const userProfile = await Profile.findOne({
      _id: user.profileId,
    });

    if (description !== "") {
      userProfile.description = description;
    }

    if (about !== "") {
      userProfile.about = about;
    }
    if (dob !== "") {
      userProfile.dob = dob;
    }
    if (contact_no !== "") {
      userProfile.contact_no = contact_no;
    }

    await userProfile.save();

    const data = await User.findOne({ _id: _id }).populate("profileId").exec();

    data.password = null;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update details.",
      error: err.message,
    });
  }
};

exports.updateProfileImg = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileImg = req.files.image;

    if (!profileImg) {
      return res.status(400).json({
        success: false,
        message: "Image missing.",
      });
    }

    const user = await User.findOne({ _id: userId });

    //remove previous image
    await deleteImageFromCloudinary(user?.profile_image);

    //upload at cloud
    const response = await uploadImageToCloudinary(
      profileImg,
      process.env.MEDIA_FOLDER
    );

    const new_user = await User.findOneAndUpdate(
      { _id: userId },
      {
        profile_image: response.secure_url,
      },
      {
        new: true,
      }
    ).populate("profileId");

    new_user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Profile image updated",
      data: new_user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update",
      error: err.message,
    });
  }
};
