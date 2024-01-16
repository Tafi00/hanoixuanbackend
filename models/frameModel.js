// models/questionModel.js
const mongoose = require("mongoose");
const frameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  { timestamps: true }
);

const Frame = mongoose.model("Frame", frameSchema);

module.exports = Frame;
