// const { loginCheck } = require("../middleware/loggedInCheck");
const { authorize } = require("../middleware/authorization");
const { authenticate } = require("../middleware/authentication");

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
router.post("/addWorker", authenticate, authorize(["boss"]), addWorker);
router.post(
  "/updateWorkerDetails",
  authenticate,
  authorize(["boss"]),
  updateWorkerDetails
);
router.get("/getAllWorkers", authenticate, authorize(["boss"]), getAllWorkers);
router.delete(
  "/deleteWorker/:workerId",
  authenticate,
  authorize(["boss"]),
  deleteWorker
);
module.exports = router;
