const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  description: {
    type: String,
  },
  about: {
    type: String,
  },
  dob: {
    type: String,
  },
  contact_no: {
    type: String,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
