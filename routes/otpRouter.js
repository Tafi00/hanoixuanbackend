const OTPSession = require("../models/otpModel"); // Import your OTPSession model
const { generateRandomOTP, generateTokens, sendZNS } = require("../utils/auth"); // Import your utility functions
const User = require("../models/userModel");
const express = require("express");

const router = express.Router();

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  // Kiểm tra xem có phiên OTP hiện tại nào đang hiệu lực không
  const existingSession = await OTPSession.findOne({
    phone,
    expirationTime: { $gt: Date.now() },
  });

  if (existingSession) {
    // Nếu có phiên hiện tại, bạn có thể tái sử dụng nó thay vì tạo mới
    res.json({
      message: "Existing OTP session found",
      sessionId: existingSession._id,
    });
  } else {
    // Tạo mới một phiên OTP nếu không có phiên hiện tại
    const otpData = generateRandomOTP();
    const otpSession = new OTPSession({
      phone,
      otp: otpData,
      expirationTime: Date.now() + 5 * 60 * 1000, // 5 minutes expiration time
    });
    sendZNS(phone.replace("0", "84"), otpData);
    await otpSession.save();
    res.json({ message: "OTP sent successfully", sessionId: otpSession._id });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { phone, otp, name } = req.body;

  // Kiểm tra xem OTP có tồn tại và còn hạn chế không
  const otpSession = await OTPSession.findOne({ phone, otp });
  const userData = await User.findOne({ phone: phone });

  if (!otpSession || otpSession.expirationTime < Date.now()) {
    // Check if OTP is invalid or expired
    return res.status(401).json({ message: "Invalid or expired OTP" });
  }

  // Perform any additional checks if needed

  // Delete the OTP session after successful verification
  await otpSession.deleteOne();
  let user = {};
  // You should have user information available for generating tokens. Modify accordingly.
  if (userData) {
    user = { phone, userId: userData._id, name: userData.name }; // Replace with your user retrieval logic
  } else {
    const newUser = new User({
      name: name,
      phone: phone,
    });
    newUser.save();
    user = { phone, userId: newUser._id, name };
  }
  const accessToken = generateTokens(user);

  res.json({ message: "OTP verified successfully", token: accessToken });
});
module.exports = router;
