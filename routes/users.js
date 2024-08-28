var express = require("express");
const { quizCollection } = require("../models/quizModel");
const verifyAuth = require("../middleware/verifyAuth");
const activeQuizCollection = require("../models/activeQuizModel");
const { quizHistoryCollection } = require("../models/quizHistoryModel");
const rolesAllowed = require("../middleware/roleBasedAuth");
var router = express.Router();

router.use(verifyAuth);

router.use(rolesAllowed(["user"]));

// Gotten from app
router.get("/emit-an-event", (req, res) => {
  try {
    // req.io.send(
    //   "hello, this is an event fired from the 'emit-an-event' endpiont."
    // );
    req.io
      .to(req.userDetails.userId)
      .emit(
        "sample",
        "hello, this is an event fired from the 'emit-an-event' endpiont. This event is for " +
          req.userDetails.fullName
      );
    // Not working
    // req.io
    //   .to(req.userDetails.userId)
    //   .send("This message is for you " + req.userDetails.fullName);
    res.send("Event emitted");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/quiz/:questionNumber", async function (req, res, next) {
  const { questionNumber } = req.params;

  const quiz = await quizCollection.findOne(
    { questionNumber },
    "-correctOption -createdAt -updatedAt"
  );

  res.json({ quiz });
});

router.post("/answer-a-question", async function (req, res, next) {
  const { quiz, optionChosen } = req.body;

  const questionAlreadyAnswered = await activeQuizCollection.exists({
    user: req.userDetails.userId,
    quiz,
  });

  if (questionAlreadyAnswered) {
    res.status(400).send({
      message: "This question has already been answered by you",
    });
    return;
  }

  await activeQuizCollection.create({
    quiz,
    optionChosen,
    user: req.userDetails.userId,
  });

  res.json({ message: "Answer recorded" });
});

router.get("/unanswered-question-numbers", async function (req, res, next) {
  try {
    const answeredQuiz = await activeQuizCollection
      .find({
        user: req.userDetails.userId,
      })
      .populate("quiz", "questionNumber");

    const answeredNumber = answeredQuiz.map((q) => q.quiz.questionNumber);
    const totalQuestions = await quizCollection.countDocuments({});

    const unansweredQuestions = [];

    for (let i = 1; i <= totalQuestions; i++) {
      if (answeredNumber.includes(i)) {
        unansweredQuestions.push({
          questionNumber: i,
          state: "answered",
        });
      } else {
        unansweredQuestions.push({
          questionNumber: i,
          state: "unanswered",
        });
      }
    }

    res.send({ unansweredQuestions });
  } catch (error) {
    next(error);
  }
});

router.post("/mark-quiz", async function (req, res, next) {
  const activeQuiz = await activeQuizCollection
    .find({
      user: req.userDetails.userId,
    })
    .populate("quiz", "-questionNumber");

  const { quiz, optionChosen } = req.body;

  let totalMarks = 0;
  let totalAnsweredQuestions = activeQuiz.length;
  let totalCorrectQuestions = 0;
  let totalIncorrectQuestions = 0;

  for (let question of activeQuiz) {
    if (question.quiz.correctOption == question.optionChosen) {
      totalMarks += 10;
      totalCorrectQuestions += 1;
    } else {
      totalIncorrectQuestions += 1;
    }
  }

  await quizHistoryCollection.create({
    score: totalMarks,
    totalCorrectQuestions,
    totalIncorrectQuestions,
    questions: activeQuiz,
    user: req.userDetails.userId,
  });

  await activeQuizCollection.deleteMany({
    user: req.userDetails.userId,
  });

  res.json({
    totalMarks,
    totalAnsweredQuestions,
    totalCorrectQuestions,
    totalIncorrectQuestions,
  });
});

router.get("/quiz-history", async function (req, res, next) {
  try {
    const result = await quizHistoryCollection.paginate({
      user: req.userDetails.userId,
    });

    res.send({ result });
  } catch (error) {
    next(error);
  }
});

router.get("/quiz-history/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const result = await quizHistoryCollection.findById(id);

    res.send({ result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
