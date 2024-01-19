var cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const userRoutes = require("./routes/userRouter");
const otpRoutes = require("./routes/otpRouter");
const frameRoutes = require("./routes/frameRouter");
const questionRoutes = require("./routes/questionRouter");
const questions = require("./output.json");
const app = express();
const port = 3300;
require("dotenv").config();

var bodyParser = require("body-parser");
mongoose.connect("mongodb://localhost:27017/hanoixuan").then(async () => {});

const serviceAccount = require("./hanoixuan-446a9-firebase-adminsdk-dv9hc-9a8b65d39e.json");
const Question = require("./models/questionModel");
// for (var x in questions) {
//   const data = questions[x];
//   if (x >= 20) {
//     Question.create({
//       answer: data.answer,
//       question: data.question,
//       category: "trenben_duoithuyen",
//       correctAnswer: data.selected,
//       type: "hard",
//     });
//   } else {
//     Question.create({
//       answer: data.answer,
//       question: data.question,
//       category: "trenben_duoithuyen",
//       correctAnswer: data.selected,
//       type: "easy",
//     });
//   }
// }
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "100mb",
    extended: true,
    parameterLimit: 100000,
  })
);
app.use("/user", userRoutes);
app.use("/question", questionRoutes);
app.use("/frame", frameRoutes);
app.use("/auth", otpRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
