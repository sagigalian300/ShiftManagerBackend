const express = require("express");
const { workerLoginCheck } = require("../middleware/workerLoggedInCheck");

const {
  getWeekToAssignTo,
  addWorkerSuggestedAssignment,
} = require("../controllers/workerAssignmentsController");
const router = express.Router();

router.get("/getWeekToAssignTo", workerLoginCheck, getWeekToAssignTo);
router.post(
  "/addWorkerSuggestedAssignment",
  workerLoginCheck,
  addWorkerSuggestedAssignment
);

module.exports = router;
