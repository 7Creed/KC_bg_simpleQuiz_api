const app = require("../bin/www");
const request = require("supertest");
const mongoose = require("mongoose");
const { quizCollection } = require("../models/quizModel");

let adminToken = "";
let quizId = "";

beforeAll(async () => {
  await quizCollection.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  app.close();
});

describe("Testing admin routes", () => {
  test("Login the admin", async () => {
    const response = await request(app).post("/v1/auth/login").send({
      email: "admin.abujaAdmin@gmail.com",
      password: "12245",
    });

    adminToken = response.body.userToken;

    expect(response.status).toBe(200);
  });

  test("Add a quiz", async () => {
    const response = await request(app)
      .post("/v1/admin/quiz")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        questionNumber: "1",
        question: "What is a baby lion called?",
        optionA: "Baby lion",
        optionB: "Cob",
        optionC: "Lioness",
        optionD: "Lion baby",
        correctOption: "optionB",
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Quiz created");
  });

  test("Add a second quiz", async () => {
    const response = await request(app)
      .post("/v1/admin/quiz")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        questionNumber: "2",
        question: "The full meaning of W.H.O. is  ________?",
        optionA: "World Happy Organization",
        optionB: "World Health Organization",
        optionC: "Wound Happy and Organism",
        optionD: "Wall Handle and Opacity",
        correctOption: "optionB",
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Quiz created");
  });

  test("Get a list quiz", async () => {
    const response = await request(app)
      .get("/v1/admin/quiz/1/10")
      .set("Authorization", `Bearer ${adminToken}`);

    quizId = response.body.quizList.docs[0]._id;

    expect(response.status).toBe(200);
    expect(typeof response.body.quizList).toBe("object");
    // expect(response.body.quizList.docs[0].questionNumber).toBe(1);
  });

  test("Get quiz by Id", async () => {
    const response = await request(app)
      .get("/v1/admin/quiz-by-id/" + quizId)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.quiz.question).toBe("What is a baby lion called?");
  });
});
