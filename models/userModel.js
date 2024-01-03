// models/userModel.js
const mongoose = require("mongoose");
const cron = require("node-cron");
const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  uid: String,
  hathanh_score: {
    type: Number,
    default: 0,
  },
  trenben_score: {
    type: Number,
    default: 0,
  },
  sacdao_score: {
    type: Number,
    default: 0,
  },
  playCount: {
    type: Number,
    default: 3,
  },
  isShare: {
    type: Boolean,
    default: false,
  },
  isLike: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);
// Cron job để reset playCount mỗi ngày
cron.schedule("0 0 * * *", async () => {
  try {
    // Reset playCount về 3 chỉ cho những người dùng có playCount < 3
    await User.updateMany(
      { playCount: { $lt: 3 } },
      { $set: { playCount: 3, isLike: false, isShare: false } }
    );
    console.log("playCount reset successful.");
  } catch (error) {
    console.error("Error resetting playCount:", error);
  }
});
module.exports = User;
