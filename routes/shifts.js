const express = require("express");
const {
  addWeeklyShifts,
  getAllWeeks,
  getDaysByWeekId,
  getShiftsByDayId,
  addShiftAssignments,
  getShiftAssignments,
} = require("../controllers/weeksController");
const router = express.Router();

router.post("/addWeeklyShifts", addWeeklyShifts);
router.post("/addShiftAssignments", addShiftAssignments);
router.get("/getAllWeeks", getAllWeeks);
router.get("/getDaysByWeekId/:week_id", getDaysByWeekId);
router.get("/getShiftsByDayId/:day_id", getShiftsByDayId);
router.get("/getShiftAssignments/:shift_id", getShiftAssignments);


module.exports = router;
