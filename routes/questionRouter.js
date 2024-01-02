const express = require("express");
const Session = require("../models/sessionModel");
const Question = require("../models/questionModel");
const { verifyToken } = require("../middlewares/authMiddleware");
const User = require("../models/userModel");
const router = express.Router();
async function decreasePlayCount(req) {
  try {
    await User.updateOne({ uid: req.user.uid }, { $inc: { playCount: -1 } });
  } catch (error) {
    console.error("Error updating playCount:", error);
  }
}
router.get("/startSession", verifyToken, async (req, res) => {
  try {
    // Kiểm tra xem user có phiên đang hoạt động không
    const activeSession = await Session.findOne({
      uid: req.user.uid,
      endTime: null, // Phiên chưa kết thúc sẽ không có endTime
    }).sort({ startTime: -1 }); // Lấy phiên mới nhất
    const currentUser = await User.findOne({ uid: req.user.uid });
    if (activeSession) {
      // Trả về thông tin của phiên đang hoạt động
      const answeredQuestionIds = activeSession.questionsAnswered.map(
        (answer) => answer.questionId
      );
      const questions = await Question.find(
        { _id: { $in: answeredQuestionIds } },
        "-correctAnswer"
      );
      const sortedQuestions = answeredQuestionIds
        .map((id) =>
          questions.find(
            (question) => question._id.toString() === id.toString()
          )
        )
        .filter((question) => question);
      return res
        .status(200)
        .json({ sessionId: activeSession._id, questions: sortedQuestions });
    }
    if (currentUser.playCount <= 0) {
      res.status(400).json({ message: "Bạn đã hết lượt chơi" });
    }
    await decreasePlayCount(req);

    // Nếu không có phiên đang hoạt động, tạo phiên mới
    const questions = await Question.aggregate([
      { $match: { category: "hathanh_vanhien" } },
      { $sample: { size: 20 } },
      { $unset: "correctAnswer" },
    ]);
    const session = await Session.create({
      uid: req.user.uid,
      questionsAnswered: questions.map((question) => ({
        questionId: question._id,
        userAnswer: null,
        isCorrect: null,
      })),
      score: 0,
    });

    res.status(200).json({ sessionId: session._id, questions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to start session", error });
  }
});
router.post("/answer/:sessionId", verifyToken, async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;

    // Tìm phiên theo sessionId
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Kiểm tra thời gian
    const currentTime = new Date();
    const startTime = new Date(session.startTime);
    const elapsedTime = (currentTime - startTime) / 1000; // Đổi sang giây
    const isAnswered = session.questionsAnswered.some(
      (answeredQuestion) =>
        answeredQuestion.questionId.toString() === questionId &&
        answeredQuestion.userAnswer !== null
    );

    if (isAnswered) {
      return res
        .status(400)
        .json({ message: "Question already answered in this session" });
    }
    if (elapsedTime >= 60) {
      return res.status(400).json({ message: "Session time exceeded" });
    }

    // Tìm câu hỏi
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Kiểm tra câu trả lời
    const isCorrect = question.correctAnswer.includes(userAnswer);

    session.questionsAnswered.forEach((answer) => {
      if (answer.questionId.toString() === questionId) {
        answer.userAnswer = userAnswer;
        answer.isCorrect = isCorrect;
      }
    });

    // Cập nhật điểm số
    if (isCorrect) {
      session.score += 10;
    }

    await session.save();

    res.status(200).json({ isCorrect });
  } catch (error) {
    res.status(500).json({ message: "Failed to answer question", error });
  }
});

router.get("/get-result", verifyToken, async (req, res) => {
  try {
    // Lấy phiên cuối cùng của user
    const session = await Session.findOne({ uid: req.user.uid })
      .sort({ startTime: -1 }) // Sắp xếp theo thời gian giảm dần để lấy phiên mới nhất
      .limit(1);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Kiểm tra thời gian kết thúc phiên
    const currentTime = new Date();
    const startTime = new Date(session.startTime);
    const elapsedTime = (currentTime - startTime) / 1000; // Đổi sang giây
    const isEnd = req.query.isEnd;

    const currentScore = await User.findOne({ uid: req.user.uid });

    if (elapsedTime >= 60 || isEnd == "true") {
      if (session.endTime == null || isEnd == "true") {
        await session.updateOne({ $set: { endTime: Date.now() } });
      }
      if (currentScore.hathanh_score < session.score) {
        await currentScore.updateOne({
          $set: { hathanh_score: session.score },
        });
      }
      if (isEnd) {
        return res.status(200).json({
          score: session.score,
          questionsAnswered: session.questionsAnswered,
          startTime: session.startTime,
          endTime: session.endTime,
          message: "End by complete",
        });
      }
      return res.status(200).json({
        score: session.score,
        questionsAnswered: session.questionsAnswered,
        startTime: session.startTime,
        endTime: session.endTime,
      });
    } else if (session.endTime == null) {
      return res.status(200).json({
        score: session.score,
        questionsAnswered: session.questionsAnswered,
        startTime: session.startTime,
        message: "Session is still active",
        endTime: session.endTime,
      });
    }
    return res.status(200).json({
      score: session.score,
      questionsAnswered: session.questionsAnswered,
      startTime: session.startTime,
      endTime: session.endTime,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get session result", error });
  }
});
router.get("/get-:id-rank", async (req, res) => {
  try {
    // Sử dụng phương thức 'find' của Mongoose để lấy ra 10 người dùng có 'hathanh_score' cao nhất.
    const filter =
      req.params.id == "hathanh"
        ? "-phone -trenben_score -sacdao_score -playCount -isShare -v"
        : req.params.id == "sacdao"
        ? "-phone -trenben_score -hathanh_score -playCount -isShare -v"
        : "-phone -sacdao_score -hathanh_score -playCount -isShare -v";
    let sortField;
    switch (req.params.id) {
      case "hathanh":
        sortField = "hathanh_score";
        break;
      case "sacdao":
        sortField = "sacdao_score";
        break;
      default:
        sortField = "trenben_score";
        break;
    }

    const topUsers = await User.find({}, filter)
      .sort({ [sortField]: -1 }) // sắp xếp giảm dần theo trường điểm được chọn
      .limit(10); // giới hạn số lượng người dùng trả về là 10
    const cloneArr = JSON.parse(JSON.stringify(topUsers));
    cloneArr.forEach((obj) => {
      obj.score = obj[sortField]; // Cập nhật trường score dựa trên trường điểm được chọn
    });

    res.status(200).json(cloneArr);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu từ cơ sở dữ liệu" });
  }
});
router.get("/shareMission", verifyToken, async (req, res) => {
  const currentUser = await User.findOne({ uid: req.user.uid });
  if (!currentUser.isShare) {
    await currentUser.updateOne({ $inc: { playCount: 1 } });
    return res.status(200).json({
      message: "Bạn đã được thêm một lượt chơi từ nhiệm vụ share trên facebook",
    });
  }
  return res.status(200).json({
    message: "Bạn đã nhận thưởng từ nhiệm vụ này rồi",
  });
});
module.exports = router;
