var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const sharedRouter = require("./routes/shared");
const cloudinary = require("cloudinary");
require("dotenv").config();
var http = require("http");
const { Server } = require("socket.io");
const jasonwebToken = require("jsonwebtoken");

var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");

var app = express();

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
const io = new Server(server);

/**
 * Listen on provided port, on all network interfaces.
 */

app.use((req, _res, next) => {
  try {
    const authToken = socket.handshake.headers.authorization.split(" ");
    const strategy = authToken[0];
    const jwt = authToken[1];

    if (strategy.toLocaleLowerCase() != "bearer") {
      socket.send("Error: Your strategy is incorrect");
    }

    const userDetails = jasonwebToken.verify(jwt, process.env.API_SECRET);

    socket.handshake.auth.userDetails = userDetails;

    next();
  } catch (error) {
    next(error);
  }
});

io.use((socket, next) => {
  req.io = io;
  next();
});

// Moved to socket.js
io.on("connection", (socket) => {
  // socket.emit("Welcome, you are connected and this is your ID: ", socket.id);
  socket.emit(
    "connection_response",
    "Welcome, you are connected and this is your ID: " + socket.id
  );
  console.log("A new connection detected. The connection ID is, ", socket.id);
  // console.log(
  //   "The connected user details are as follows: ",
  //   socket.handshake.auth.userDetails
  // );
  const userDetails = socket.handshake.auth.userDetails;

  socket.join(userDetails.userId);

  socket.on("greet", (greetingMessage) => {
    console.log("Here is a greeting to you ", greetingMessage);
    socket.send("The server received your greeting...");
    // =========
    // socket.emit("message", "The server received your greeting...");
    socket.send("And I want to thank you for greeeting me");
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected. The user ID is: ", socket.id);
    socket.leave(userDetails.userId);
  });
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("An error occurred: ", err);
  });

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/v1/auth", authRouter);
app.use("/v1/admin", adminRouter);
app.use("/v1/users", usersRouter);
app.use("/v1/shared", sharedRouter);

// Moved to www.... Moved to users
// app.get("/emit-an-event", (req, res) => {
//   try {
//     req.io.send(
//       "hello, this is an event fired from the 'emit-an-event' endpiont."
//     );
//     res.send("Event emitted");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Internal server error");
//   }
// });

app.get("/", (req, res) => {
  res.status(200);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).send(res.locals.error);
});

module.exports = { server, port };
