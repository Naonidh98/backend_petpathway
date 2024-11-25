const User = require("../models/User");
const Pet = require("../models/Pet");
const {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} = require("../utils/uploadMedia");

//create pet
exports.createPet = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      age,
      gender,
      breed,
      vaccinated,
      state,
      city,
    } = req.body;
    const userId = req.user._id;

    if (
      !userId ||
      !name ||
      !description ||
      !type ||
      !age ||
      !breed ||
      !vaccinated ||
      !gender ||
      !state ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    //create pet
    const data = await Pet.create({
      name,
      description,
      type,
      age,
      breed,
      vaccinated,
      gender,
      owner: userId,
      state,
      city,
    });

    return res.status(200).json({
      success: true,
      message: "Created Successfully",
      data: data._id,
      pet: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create",
      error: err.message,
    });
  }
};

//edit pet
exports.editPet = async (req, res) => {
  try {
    const {
      petId,
      name = "",
      description = "",
      type = "",
      age = "",
      gender = "",
      breed = "",
      vaccinated = "",
      state = "",
      city = "",
    } = req.body;
    const userId = req.user._id;

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "Missing Id",
      });
    }

    const pet = await Pet.findOne({ _id: petId });

    if (name !== "") {
      pet.name = name;
    }
    if (description !== "") {
      pet.description = description;
    }
    if (type !== "") {
      pet.type = type;
    }
    if (age !== "") {
      pet.age = age;
    }
    if (gender !== "") {
      pet.gender = gender;
    }
    if (vaccinated !== "") {
      pet.vaccinated = vaccinated;
    }
    if (breed !== "") {
      pet.breed = breed;
    }
    if (state !== "") {
      pet.state = state;
    }
    if (city !== "") {
      pet.city = city;
    }

    await pet.save();

    return res.status(200).json({
      success: true,
      message: "edit Successfully",
      data: pet._id,
      pet: pet,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create",
      error: err.message,
    });
  }
};

//delete pet
exports.deletePet = async (req, res) => {
  try {
    const { petId } = req.body;

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "Missing Id",
      });
    }

    const data = await Pet.findOneAndDelete({ _id: petId });

    if (data?.thumbnail) {
      await deleteImageFromCloudinary(data.thumbnail);
    }

    return res.status(200).json({
      success: true,
      message: "delete Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create",
      error: err.message,
    });
  }
};

//add / remove media
exports.addMedia = async (req, res) => {
  try {
    const { petId } = req.body;
    const img = req?.files?.image || null;

    if (!img) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    const data = await Pet.findOne({ _id: petId });

    if (data?.thumbnail) {
      await deleteImageFromCloudinary(data.thumbnail);
    }

    //add thumbnail
    const response = await uploadImageToCloudinary(img);

    const resdata = await Pet.findByIdAndUpdate(
      {
        _id: petId,
      },
      {
        thumbnail: response.secure_url,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Media added",
      data: resdata,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to add",
      error: err.message,
    });
  }
};

//get pet details
exports.getPetDetails = async (req, res) => {
  try {
    const { petId } = req.body;

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    const data = await Pet.findOne({ _id: petId })
      .populate("owner", "firstName lastName email")
      .exec();

    return res.status(200).json({
      success: true,
      message: "successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch",
      error: err.message,
    });
  }
};

//fetch pets
exports.getPetUser = async (req, res) => {
  try {
    const { state } = req.body;

    if (!state) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    const data = await Pet.find({ state: state })
      .populate("owner", "firstName lastName email").sort({createdAt : -1})
      .exec();

    return res.status(200).json({
      success: true,
      message: "data fetched successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch",
      error: err.message,
    });
  }
};
