const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")

const authMiddleware = async (req, res, next) => {
  try {
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]
    }
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await userModel.findById(decoded.id).select("-password")

    if (!req.user || !req.user.isActive) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Not authorized, user not found or inactive",
        })
    }
    next()
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" })
  }
};

module.exports = {
  authMiddleware,
};
