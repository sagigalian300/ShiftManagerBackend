const {
  getWeekToAssignToFromDB,
  addWorkerSuggestedAssignmentToDB,
  getWorkerSuggestionsForWeekFromDB,
  getWorkersSuggestionsFullyDetailedForWeekFromDB,
} = require("../models/WorkerAssignmentsCRUD");
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

async function getWorkersSuggestionsForWeek(req, res) {
  const weekId = req.params.weekId;
  const result = await getWorkersSuggestionsFullyDetailedForWeekFromDB(weekId);
  if (result.success) {
    res.json({ success: true, data: result.data });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
}

module.exports = {
  getWeekToAssignTo,
  addWorkerSuggestedAssignment,
  getWorkersSuggestionsForWeek,
};
