
const { addWorker, getAllWorkers } = require("../controllers/workersController");

const express = require("express");
const router = express.Router();

router.post("/addWorker", addWorker);
router.get("/getAllWorkers", getAllWorkers);
module.exports = router;
