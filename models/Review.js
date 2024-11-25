const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  rating: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
