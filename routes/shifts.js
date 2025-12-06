const { loginCheck } = require("../middleware/loggedInCheck");
const express = require("express");
const {
  addWeeklyShifts,
  getAllWeeks,
  getDaysByWeekId,
  getShiftsByDayId,
  addShiftAssignments,
  getShiftAssignments,
  getEncryptedBossAndWeek,
  smartWeeklyShiftsBuilder,
  getWeekDataForExcelDocument,
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
router.get(
  "/smartWeeklyShiftsBuilder/:week_id",
  loginCheck,
  smartWeeklyShiftsBuilder
);
router.get(
  "/getWeekDataForExcelDocument/:week_id",
  loginCheck,
  getWeekDataForExcelDocument
);

module.exports = router;
