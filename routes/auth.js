var express = require("express");
const { userCollection } = require("../models/usersModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var router = express.Router();

/* GET home page. */
router.post("/register", async function (req, res, next) {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).send({
      message: "Full name, email, and password are required.",
    });
  }

  const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  await userCollection.create({ fullName, email, password: hashedPassword });

  res.status(201).send({
    isSuccessful: true,
    message: "Created",
  });
});

router.post("/login", async function (req, res, next) {
  const { email, password } = req.body;

  // find, findOne, findById, findByAndUpdate, findOneAndUpdate
  // updateMany, deleteMany, countDocuments, findByAndDelete, findOneAndDelete
  // distinct

  const userDetails = await userCollection.findOne({ email });

  if (!userDetails) {
    return res.status(404).send({
      isSuccessful: false,
      message: "User not found",
    });
  }

  const passwordMatch = bcrypt.compareSync(password, userDetails.password);

  if (!passwordMatch) {
    return res.status(401).send({
      isSuccessful: false,
      message: "incorrect password",
    });
  }

  const userToken = jwt.sign(
    {
      userId: userDetails._id,
      fullName: userDetails.fullName,
      email: userDetails.email,
      role: userDetails.role,
    },
    process.env.AUTH_SECRET
  );

  res.status(200).send({
    isSuccessful: true,
    userDetails: {
      fullName: userDetails.fullName,
      email: userDetails.email,
      role: userDetails.role,
    },
    userToken,
    message: "Logged in successfully",
  });
});

module.exports = router;
