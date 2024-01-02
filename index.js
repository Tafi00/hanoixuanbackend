var cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const userRoutes = require("./routes/userRouter");
const questionRoutes = require("./routes/questionRouter");
const questions = require("./output.json");
const app = express();
const port = 3300;

mongoose.connect("mongodb://localhost:27017/hanoixuan");

const serviceAccount = require("./hanoixuan-446a9-firebase-adminsdk-dv9hc-9a8b65d39e.json");
const Question = require("./models/questionModel");
// for (var x of questions) {
//   Question.create({
//     answer: x.answer,
//     question: x.question,
//     category: "hathanh_vanhien",
//     correctAnswer: x.selected,
//   });
// }
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/question", questionRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
