const mongoose = require("mongoose");

const cateogorySchema = new mongoose.Schema({
  title: {
    type: String,
    maxLength: 15,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
  thumbnail  : {
    type : String,
    required : true
  }
},{
  timestamps : true
});

module.exports = mongoose.model("Category",cateogorySchema);