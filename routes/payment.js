const express = require("express");
const router = express.Router();

const { capturePayment , verifySignature } = require("../controllers/Order");
const { auth, isUser } = require("../middlewares/AuthMiddleware")

router.post("/capturePayment", auth, isUser, capturePayment)
router.post("/verifyPayment",auth,verifySignature)


module.exports = router;