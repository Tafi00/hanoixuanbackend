// models/questionModel.js
const mongoose = require("mongoose");
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    require: true,
    unique: true,
  },
  answer: {
    type: Array,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
  correctAnswer: String,
  category: {
    type: String,
    require: true,
  },
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
