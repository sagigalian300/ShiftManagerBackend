const { loginCheck } = require("../auth/loggedInCheck");
const express = require("express");
const {
  addWeeklyShifts,
  getAllWeeks,
  getDaysByWeekId,
  getShiftsByDayId,
  addShiftAssignments,
  getShiftAssignments,
  getEncryptedBossAndWeek,
} = require("../controllers/weeksController");
const router = express.Router();

router.post("/addWeeklyShifts", loginCheck, addWeeklyShifts);
router.post("/addShiftAssignments", loginCheck, addShiftAssignments);
router.get("/getAllWeeks", loginCheck, getAllWeeks);
router.get("/getDaysByWeekId/:week_id", loginCheck, getDaysByWeekId);
router.get("/getShiftsByDayId/:day_id", loginCheck, getShiftsByDayId);
router.get("/getShiftAssignments/:shift_id", loginCheck, getShiftAssignments);
router.get(
  "/getEncryptedBossAndWeek/:week_id",
  loginCheck,
  getEncryptedBossAndWeek
);

module.exports = router;
