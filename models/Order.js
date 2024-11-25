const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    order_code: {
      type: String,
      required: true,
    },
    details: {
      type: Object,
      required: true,
    },
    customer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
