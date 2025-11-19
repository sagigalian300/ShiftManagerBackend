const express = require("express");
const cors = require("cors");
require("dotenv").config();

const usersRouter = require("./routes/users");
const rolesRouter = require("./routes/roles");
const workersRouter = require("./routes/worker");

const PORT = process.env.PORT || 3001;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/user", usersRouter);
app.use("/role", rolesRouter);
app.use("/worker", workersRouter);

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
