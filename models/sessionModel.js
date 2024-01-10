const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  uid: {
    type: String,
  },
  questionsAnswered: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
      userAnswer: String,
      isCorrect: Boolean,
    },
  ],
  category: {
    type: String,
    require: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: null,
  },
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
