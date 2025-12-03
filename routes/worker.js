const { loginCheck } = require("../middleware/loggedInCheck");
const {
  addWorker,
  getAllWorkers,
  updateWorkerDetails,
  deleteWorker,
  workerLogin,
} = require("../controllers/workersController");

const express = require("express");
const router = express.Router();

router.post("/workerLogin", workerLogin);
router.post("/addWorker", loginCheck, addWorker);
router.post("/updateWorkerDetails", loginCheck, updateWorkerDetails);
router.get("/getAllWorkers", loginCheck, getAllWorkers);
router.delete("/deleteWorker/:workerId", loginCheck, deleteWorker);

module.exports = router;
