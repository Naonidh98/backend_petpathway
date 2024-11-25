const express = require("express");
const router = express.Router();

//import controllers
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword");

//send reset password token
router.post("/password-reset/token", resetPasswordToken);

//reset password
router.post("/password-reset", resetPassword);

module.exports = router;
