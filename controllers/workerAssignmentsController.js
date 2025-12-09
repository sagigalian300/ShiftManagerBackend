const {
  getWeekToAssignToFromDB,
  addWorkerSuggestedAssignmentToDB,
} = require("../models/workerAssignmentsCRUD");
const { getWorkerNameById } = require("../models/WorkerCRUD");

async function getWeekToAssignTo(req, res) {
  const weekId = req.user.weekId;
  const workerId = req.user.workerId;

  const resultName = await getWorkerNameById(workerId);
  const workerName =
    resultName.data.first_name + " " + resultName.data.last_name;

  const result = await getWeekToAssignToFromDB(weekId);
  if (result.success) {
    res.json({ success: true, data: result.data, workerName });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
}

async function addWorkerSuggestedAssignment(req, res) {
  const { suggestion } = req.body;
  const workerId = req.user.workerId;

  const result = await addWorkerSuggestedAssignmentToDB(suggestion, workerId);
  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({
    success: true,
    message: "Worker suggested assignment added successfully",
  });
}

module.exports = { getWeekToAssignTo, addWorkerSuggestedAssignment };
