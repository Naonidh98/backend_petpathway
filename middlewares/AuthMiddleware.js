require("dotenv").config();
const jwt = require("jsonwebtoken");

//auth middleware
exports.auth = async (req, res, next) => {
  try {
    //fetch token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer ", "");

    //missing token
    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Token missing",
      });
    }

    //validate token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Invalid token, Login again",
        error: err.message,
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

//is Admin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.type !== "admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

//is User
exports.isUser = async (req, res, next) => {
  try {
    if (req.user.type !== "user") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for User only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

//is Moderator
exports.isModerator = async (req, res, next) => {
  try {
    if (req.user.type !== "Moderator") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Moderators only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};
