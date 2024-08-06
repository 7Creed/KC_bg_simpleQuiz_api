const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const quizHistorySchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
    },
    totalCorrectQuestions: {
      type: Number,
      required: true,
    },
    totalIncorrectQuestions: {
      type: Number,
      required: true,
    },
    questions: {
      type: Array,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

quizHistorySchema.plugin(mongoosePaginate);

const quizHistoryCollection = mongoose.model("quizHistory", quizHistorySchema);

module.exports = {
  quizHistoryCollection,
};
