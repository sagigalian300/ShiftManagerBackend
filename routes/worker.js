const { loginCheck } = require("../auth/loggedInCheck");
const {
  addWorker,
  getAllWorkers,
  updateWorkerDetails,
} = require("../controllers/workersController");

const express = require("express");
const router = express.Router();

router.post("/addWorker", loginCheck, addWorker);
router.post("/updateWorkerDetails", loginCheck, updateWorkerDetails)
router.get("/getAllWorkers", loginCheck, getAllWorkers);

module.exports = router;
