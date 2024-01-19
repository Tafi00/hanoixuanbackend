// middlewares/authMiddleware.js
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const accessToken = authHeader?.split(" ")?.[1];

  if (!accessToken) {
    return res.status(401).json({ error: "Access token not provided" });
  }
  try {
    // Verify token
    const decoded = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET);

    // Add user from payload
    req.user = {};
    req.user.uid = decoded.userId;
    const user = await User.findById(decoded.userId);

    // Kiểm tra xem user có tồn tại không
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    next();
  } catch (error) {
    console.log(error);

    res.status(400).json({ message: error });
  }
};

module.exports = { verifyToken };
