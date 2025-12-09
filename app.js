const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const usersRouter = require("./routes/users");
const rolesRouter = require("./routes/roles");
const workersRouter = require("./routes/worker");
const shiftsRouter = require("./routes/shifts");
const workerAssignmentsRouter = require("./routes/workerAssignments");
const { authenticate } = require("./middleware/authentication");
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
app.get("/status", authenticate, (req, res) => {
  // req.user was populated by your 'authenticate' middleware
  res.status(200).json({ 
    success: true, 
    roles: req.user.roles || [] // e.g., ["worker"] or ["boss", "admin"]
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
