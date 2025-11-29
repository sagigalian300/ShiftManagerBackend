const {
  getWeekToAssignToFromDB,
  addWorkerSuggestedAssignmentToDB,
} = require("../models/workerAssignmentsCRUD");

async function getWeekToAssignTo(req, res) {
  const weekId = req.weekId;

  const result = await getWeekToAssignToFromDB(weekId);
  if (result.success) {
    res.json({ success: true, data: result.data });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
}

async function addWorkerSuggestedAssignment(req, res) {
  const { suggestion } = req.body;
  const workerId = req.workerId;

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
