const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  discount: {
    type: String,
    default: "0",
    required: true,
  },
  quantity: {
    type: String,
    default: "0",
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  more_info: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Info",
    required : true
  },
  item_type : {
    type  : String,
    required : true,
    default : "Both",
  },
  createdAt: {
    type : Date,
    required : true,
    default : Date.now
  }
});

module.exports = mongoose.model("Item", itemSchema);
