const app = require("../bin/www");

const request = require("supertest");
const { userCollection } = require("../models/usersModel");
const mongoose = require("mongoose");

// describe("Admin Routes", () => {
//   let adminToken;
//   let productId;
// });

beforeAll(async () => {
  await userCollection.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  app.close();
});

describe("This is a test register and login for both admins and users", () => {
  test("Register a user", async () => {
    const response = await request(app).post("/v1/auth/register").send({
      fullName: "User Star",
      email: "user.abujaAdmin@gmail.com",
      password: "12245",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Created");
  });

  test("Register an admin", async () => {
    const response = await request(app).post("/v1/auth/register").send({
      fullName: "Admin Star",
      email: "admin.abujaAdmin@gmail.com",
      password: "12245",
    });

    await userCollection.findOneAndUpdate(
      { email: "admin.abujaAdmin@gmail.com" },
      { isEmailVerified: true, role: "admin" }
    );

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Created");
  });

  test("Login a user", async () => {
    const response = await request(app).post("/v1/auth/login").send({
      email: "user.abujaAdmin@gmail.com",
      password: "12245",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.userDetails).toBeTruthy();
    expect(response.body.userToken).toBeTruthy();
    expect(response.body.userDetails.role).toBe("user");
  });

  test("Login an admin", async () => {
    const response = await request(app).post("/v1/auth/login").send({
      email: "admin.abujaAdmin@gmail.com",
      password: "12245",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.userDetails).toBeTruthy();
    expect(response.body.userToken).toBeTruthy();
    expect(response.body.userDetails.role).toBe("admin");
  });
});
