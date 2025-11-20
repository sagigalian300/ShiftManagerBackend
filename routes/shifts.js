const express = require("express");
const {
  addWeeklyShifts,
  getAllWeeks,
  getDaysByWeekId,
} = require("../controllers/weeksController");
const router = express.Router();

router.post("/addWeeklyShifts", addWeeklyShifts);
router.get("/getAllWeeks", getAllWeeks);
router.get("/getDaysByWeekId/:week_id", getDaysByWeekId);

module.exports = router;
