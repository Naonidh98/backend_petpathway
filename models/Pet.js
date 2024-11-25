const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["Dog", "Cat"],
  },
  breed: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  vaccinated: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  state : {
    type : String,
    required : true
  },
  city : {
    type : String,
    required : true
  },
},{
  timestamps : true
});

module.exports = mongoose.model("Pet", petSchema);
