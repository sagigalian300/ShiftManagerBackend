// const { loginCheck } = require("../middleware/loggedInCheck");
const { authorize } = require("../middleware/authorization");
const { authenticate } = require("../middleware/authentication");
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
  deleteWeek,
  deleteShift,
} = require("../controllers/weeksController");

const router = express.Router();

router.post(
  "/addWeeklyShifts",
  authenticate,
  authorize(["boss"]),
  addWeeklyShifts
);
router.delete(
  "/deleteWeek/:week_id",
  authenticate,
  authorize(["boss"]),
  deleteWeek
);
router.post(
  "/addShiftAssignments",
  authenticate,
  authorize(["boss"]),
  addShiftAssignments
);
router.get("/getAllWeeks", authenticate, authorize(["boss"]), getAllWeeks);
router.get(
  "/getDaysByWeekId/:week_id",
  authenticate,
  authorize(["boss"]),
  getDaysByWeekId
);
router.get(
  "/getShiftsByDayId/:day_id",
  authenticate,
  authorize(["boss"]),
  getShiftsByDayId
);
router.get(
  "/getShiftAssignments/:shift_id",
  authenticate,
  authorize(["boss"]),
  getShiftAssignments
);
router.get(
  "/getEncryptedBossAndWeek/:week_id",
  authenticate,
  authorize(["boss"]),
  getEncryptedBossAndWeek
);
router.get(
  "/smartWeeklyShiftsBuilder/:week_id",
  authenticate,
  authorize(["boss"]),
  smartWeeklyShiftsBuilder
);
router.get(
  "/getWeekDataForExcelDocument/:week_id",
  authenticate,
  authorize(["boss"]),
  getWeekDataForExcelDocument
);
router.delete(
  "/deleteShift/:shift_id",
  authenticate,
  authorize(["boss"]),
  deleteShift
);

module.exports = router;
