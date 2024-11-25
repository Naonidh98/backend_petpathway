const express = require("express");
const router = express.Router();

//import controllers
const { updateProfile, updateProfileImg } = require("../controllers/Profile");

//middlewares
const { auth } = require("../middlewares/AuthMiddleware");

//profile data update
router.post("/update/data", auth, updateProfile);

//update profile dp
router.post("/update/image", auth, updateProfileImg);

module.exports = router;
