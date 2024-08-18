const app = require("../bin/www");
const request = require("supertest");
const mongoose = require("mongoose");
const activeQuizCollection = require("../models/activeQuizModel");

let userToken = "";
let questionOneId = "";
let questionTwoId = "";

beforeAll(async () => {
  await activeQuizCollection.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  app.close();
});

describe("Tests users routes", () => {
  test("Login a user", async () => {
    const response = await request(app).post("/v1/auth/login").send({
      email: "user.abujaAdmin@gmail.com",
      password: "12245",
    });

    userToken = response.body.userToken;

    expect(response.status).toBe(200);
  });

  test("Get question number 1", async () => {
    const response = await request(app)
      .get("/v1/users/quiz/1")
      .set("Authorization", `Bearer ${userToken}`);

    questionOneId = response.body.quiz._id;

    expect(response.status).toBe(200);
    expect(response.body.quiz.question).toBe("What is a baby lion called?");
  });

  test("Get question number 2", async () => {
    const response = await request(app)
      .get("/v1/users/quiz/2")
      .set("Authorization", `Bearer ${userToken}`);

    questionTwoId = response.body.quiz._id;

    expect(response.status).toBe(200);
    expect(response.body.quiz.question).toBe(
      "The full meaning of W.H.O. is  ________?"
    );
  });

  test("Answer question 1", async () => {
    const response = await request(app)
      .post("/v1/users/answer-a-question")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quiz: questionOneId, optionChosen: "optionB" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Answer recorded");
  });

  test("Answer question 2", async () => {
    const response = await request(app)
      .post("/v1/users/answer-a-question")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quiz: questionTwoId, optionChosen: "optionB" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Answer recorded");
  });

  test("Mark quiz", async () => {
    const response = await request(app)
      .post("/v1/users/mark-quiz")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.totalMarks).toBe(20);
    expect(response.body.totalAnsweredQuestions).toBe(2);
    expect(response.body.totalCorrectQuestions).toBe(2);
    expect(response.body.totalIncorrectQuestions).toBe(0);
  });

  //   test("Mark quiz", async () => {
  //     const response = await request(app)
  //       .post("/v1/users/quiz-history")
  //       .set("Authorization", `Bearer ${userToken}`);

  //     expect(response.status).toBe(200);
  //     expect(typeof response.body.result).toBe("object");
  //     expect(response.body.result.length).toBeGreaterThanOrEqual(1);
  //   });
});
