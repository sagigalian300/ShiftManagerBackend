const express = require("express");
// const { workerLoginCheck } = require("../middleware/workerLoggedInCheck");
const { authorize } = require("../middleware/authorization");
const { authenticate } = require("../middleware/authentication");
const {
  getWeekToAssignTo,
  addWorkerSuggestedAssignment,
  getWorkersSuggestionsForWeek,
} = require("../controllers/workerAssignmentsController");
const router = express.Router();

router.get(
  "/getWeekToAssignTo",
  authenticate,
  authorize(["worker"]),
  getWeekToAssignTo
);
router.post(
  "/addWorkerSuggestedAssignment",
  authenticate,
  authorize(["worker"]),
  addWorkerSuggestedAssignment
);
router.get(
  "/getWorkersSuggestionsForWeek/:weekId",
  authenticate,
  authorize(["boss"]),
  getWorkersSuggestionsForWeek
);

module.exports = router;
