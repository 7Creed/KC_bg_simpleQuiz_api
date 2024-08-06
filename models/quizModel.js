const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const quizSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    questionNumber: {
      type: Number,
      unique: true,
      required: true,
    },
    optionA: {
      type: String,
      required: true,
    },
    optionB: {
      type: String,
      required: true,
    },
    optionC: {
      type: String,
      required: true,
    },
    optionD: {
      type: String,
      required: true,
    },
    correctOption: {
      type: String,
      enum: ["optionA", "optionB", "optionC", "optionD"],
      required: true,
    },
  },
  { timestamps: true }
);

quizSchema.plugin(mongoosePaginate);

const quizCollection = mongoose.model("quiz", quizSchema);

module.exports = {
  quizCollection,
};
