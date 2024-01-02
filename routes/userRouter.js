// routes/userRoutes.js
const express = require("express");
const User = require("../models/userModel");
const { verifyToken } = require("../middlewares/authMiddleware");
const { getAuth } = require("firebase-admin/auth");

const router = express.Router();
router.get("/checkRegistration", async (req, res) => {
  const phone = req.query.phone;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  try {
    const user = await User.findOne({ phone: phone });
    if (user) {
      return res.status(200).json({ isRegistered: true });
    } else {
      return res.status(200).json({ isRegistered: false });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/register", (req, res) => {
  const { idToken, name } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "idToken is required" });
  }

  getAuth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const uid = decodedToken.uid;
      const phone = decodedToken.phone_number.replace("+84", "0");
      try {
        const user = await User.findOne({ phone: phone });
        if (!user) {
          const newUser = new User({ name: name, phone: phone, uid: uid });
          newUser.save();
          return res
            .status(201)
            .json({ message: "User registered successfully" });
        } else {
          return res.status(409).json({ error: "User already exists" });
        }
      } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(401).json({ error: "Invalid idToken" });
    });
});

router.get("/getProfile", verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const user = await User.findOne({ uid: uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      return res.status(200).json({
        name: user.name,
        phone: user.phone,
        uid: user.uid,
        score: user.hathanh_score,
        playCount: user.playCount,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
