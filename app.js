const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const usersRouter = require("./routes/users");
const rolesRouter = require("./routes/roles");
const workersRouter = require("./routes/worker");
const shiftsRouter = require("./routes/shifts");
const { loginCheck } = require("./auth/loggedInCheck");

const PORT = process.env.PORT || 3001;

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Routes
app.use("/user", usersRouter);
app.use("/role", rolesRouter);
app.use("/worker", workersRouter);
app.use("/shift", shiftsRouter);

// status route
app.get("/status", loginCheck, (req, res) => {
  res.status(200).send("Valid Token");
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
