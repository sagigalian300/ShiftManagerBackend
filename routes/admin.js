const { authenticate } = require("../middleware/authentication");
const { authorize } = require("../middleware/authorization");
const {
  getAllBosses,
  getAllWorkersForBossId,
  deleteBoss,
} = require("../controllers/adminController");

const express = require("express");
const router = express.Router();

router.get("/getAllBosses", authenticate, authorize(["admin"]), getAllBosses);
router.get(
  "/getAllWorkersForBossId/:bossId",
  authenticate,
  authorize(["admin"]),
  getAllWorkersForBossId
);
router.delete(
  "/deleteBoss/:bossId",
  authenticate,
  authorize(["admin"]),
  deleteBoss
);
module.exports = router;
