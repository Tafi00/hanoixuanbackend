const mongoose = require("mongoose");

const otpSessionSchema = new mongoose.Schema({
  phone: String,
  otp: String,
  expiresAt: { type: Date, default: Date.now, expires: 300 }, // Hết hạn sau 5 phút
});

const OTPSession = mongoose.model("OTPSession", otpSessionSchema);

module.exports = OTPSession;
