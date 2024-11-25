const { instance } = require("../config/razorpay");
const Order = require("../models/Order");
const Item = require("../models/Item");
const crypto = require("crypto");
require("dotenv").config();

exports.capturePayment = async (req, res) => {
  //get courseId and UserID
  const { totalAmount } = req.body;
  const userId = req.user.id;

  try {
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
    };

    try {
      //initiate the payment using razorpay
      const paymentResponse = await instance.orders.create(options);
      console.log("payment", paymentResponse);
      //return response
      return res.status(200).json({
        success: true,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifySignature = async (req, res) => {
  //get the payment details
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  const { data} = req.body;
  const userId = req.user._id;


  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Payment details are incomplete",
    });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;

  const createOrder = async (data, userId) => {
    if (!data || !userId ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid courses and user ID",
      });
    }
    try {
      await Order.create({
        order_code: Date.now(),
        details: data,
        customer: userId,
      });

      return res.status(200).json({
        success: true,
        message: "Payment successful",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  try {
    //verify the signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");
    if (generatedSignature === razorpay_signature) {
      await createOrder(data, userId);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
