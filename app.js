const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const usersRouter = require("./routes/users");
const rolesRouter = require("./routes/roles");
const workersRouter = require("./routes/worker");
const shiftsRouter = require("./routes/shifts");
const workerAssignmentsRouter = require("./routes/workerAssignments");
const { loginCheck } = require("./middleware/loggedInCheck");
const { workerLoginCheck } = require("./middleware/workerLoggedInCheck");

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
app.use("/workerAssignments", workerAssignmentsRouter);

const { computeOptimalAssignment } = require("./services/assignmentAlgorithm");
app.get("/test/:user_id/:week_id", (req, res) => {
  const { week_id, user_id } = req.params;
  computeOptimalAssignment(user_id, week_id).then((assignment) => {
    res.json(assignment);
  });
});

// status route
app.get("/status", loginCheck, (req, res) => {
  res.status(200).send("Valid Token");
});

app.get("/worker-status", workerLoginCheck, (req, res) => {
  res.status(200).send("Worker route is operational");
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
