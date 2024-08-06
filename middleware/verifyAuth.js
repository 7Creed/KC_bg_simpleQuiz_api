require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyAuth = (req, res, next) => {
  try {
    // Ensure the Authorization header is present
    if (!req.headers.authorization) {
      return res.status(403).send({
        message: "Authorization header is missing",
      });
    }
    const strategyAndToken = req.headers.authorization.split(" ");
    if (strategyAndToken.length !== 2) {
      return res.status(403).send({
        message: "Invalid authorization format",
      });
    }

    const strategy = strategyAndToken[0];
    const tokenItself = strategyAndToken[1];

    // if (strategy.toLocaleLowerCase() == "bearer") {
    if (strategy.toLowerCase() == "bearer") {
      const userDetails = jwt.verify(tokenItself, process.env.AUTH_SECRET);
      req.userDetails = userDetails;

      if (userDetails) {
        next();
      } else {
        res.status(403).send({
          message: "User details is empty for the token provided",
        });
      }
    } else {
      res.status(403).send({
        message: "You are not authorized",
      });
    }
  } catch (error) {
    console.error("Error in verifyAuth middleware:", error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

module.exports = verifyAuth;
