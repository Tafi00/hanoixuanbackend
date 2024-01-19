const express = require("express");
const multer = require("multer");
const Frame = require("../models/frameModel");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const frameId = req.newFrame._id.toString();

    // Kiểm tra tên của tệp tin là "image" hay "image_1" để xác định tên phù hợp
    let fileName;

    if (file.fieldname === "image") {
      fileName = `${frameId}.png`;
    } else if (file.fieldname === "image_1") {
      fileName = `${frameId}_metadata.png`;
    } else {
      // Xử lý trường hợp khác nếu cần
      fileName = file.originalname;
    }

    cb(null, fileName);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 /* bytes */ },
});
// API để tạo mới một Frame và lưu hình ảnh
router.post("/create", async (req, res) => {
  try {
    // Lấy thông tin từ request
    const { name } = req.body;

    // Tạo một Frame mới
    const newFrame = new Frame({
      name,
    });

    // Lưu vào MongoDB
    const savedFrame = await newFrame.save();

    // Gán newFrame vào req để sử dụng trong middleware multer
    req.newFrame = savedFrame;

    // Tiếp tục với middleware multer để xử lý upload hình ảnh
    upload.fields([{ name: "image" }, { name: "image_1" }])(req, res, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error uploading image" });
      }
      res.json({ id: savedFrame._id });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API để lấy hình ảnh dựa trên ID
router.get("/getImage/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(404).json({ error: "Frame not found" });
    }

    const imagePath = path.join(__dirname, "..", "uploads", `${req.params.id}`);

    // Trả về đường dẫn của hình ảnh
    res.sendFile(imagePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
