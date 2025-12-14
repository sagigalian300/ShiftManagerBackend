const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Import Routers
const usersRouter = require("./routes/users");
const rolesRouter = require("./routes/roles");
// const workersRouter = require("./routes/worker");
// const shiftsRouter = require("./routes/shifts");
// const workerAssignmentsRouter = require("./routes/workerAssignments");
// const adminRouter = require("./routes/admin");

const { authenticate } = require("./middleware/authentication");
// const PORT = 8080 || process.env.PORT;
const PORT = process.env.PORT || 3001;

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://shift-manager-q8f4.vercel.app",
    "https://shift-manager-q8f4-git-main-sagis-projects-b135c1d1.vercel.app",
    "https://shift-manager-q8f4-li8r4qzwb-sagis-projects-b135c1d1.vercel.app",
  ],
  allowedHeaders: ["Content-Type"],
  exposedHeaders: ["Access-Control-Allow-Origin"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/user", usersRouter);
app.use("/role", rolesRouter);
// app.use("/worker", workersRouter);
// app.use("/shift", shiftsRouter);
// app.use("/workerAssignments", workerAssignmentsRouter);
// app.use("/admin", adminRouter);

// status route
app.get("/status", authenticate, (req, res) => {
  // req.user was populated by your 'authenticate' middleware
  res.status(200).json({
    success: true,
    roles: req.user.roles || [], // e.g., ["worker"] or ["boss", "admin"]
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
