const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({
  dimensions: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  gtin: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  return: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Info", infoSchema);
