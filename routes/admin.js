const { authenticate } = require("../middleware/authentication");
const { authorize } = require("../middleware/authorization");
const { getAllBosses, getAllWorkersForBossId } = require("../controllers/adminController");

const express = require("express");
const router = express.Router();

router.get("/getAllBosses", authenticate, authorize(["admin"]), getAllBosses);
router.get("/getAllWorkersForBossId/:bossId", authenticate, authorize(["admin"]), getAllWorkersForBossId);

module.exports = router;
