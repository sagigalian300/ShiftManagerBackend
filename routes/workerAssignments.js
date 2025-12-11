const express = require("express");
// const { workerLoginCheck } = require("../middleware/workerLoggedInCheck");
const { authorize } = require("../middleware/authorization");
const { authenticate } = require("../middleware/authentication");
const {
  getWeekToAssignTo,
  addWorkerSuggestedAssignment,
} = require("../controllers/workerAssignmentsController");
const router = express.Router();

router.get(
  "/getWeekToAssignTo",
  authenticate,
  authorize(["worker"]),
  getWeekToAssignTo
);
router.post("/addWorkerSuggestedAssignment", authenticate, authorize(["worker"]), addWorkerSuggestedAssignment);

module.exports = router;
