const mongoose = require("mongoose");

const activeQuizSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Types.ObjectId,
      ref: "quiz",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    optionChosen: {
      type: String,
      enum: ["optionA", "optionB", "optionC", "optionD"],
      required: true,
    },
  },
  { timestamps: true }
);

const activeQuizCollection = mongoose.model("activeQuiz", activeQuizSchema);

module.exports = activeQuizCollection;
