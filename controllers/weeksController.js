const { encrypt } = require("../services/symmetricalEncryption/encryptor");

const {
  addWeekToDB,
  deleteWeekFromDB,
  getAllWeeksFromDB,
  getDaysByWeekIdFromDB,
  getShiftsByDayIdFromDB,
  addShiftDataToDB,
  getShiftsAssignmentsFromDB,
  insertOptimalWeeklyShiftAssignmentsToDB,
  getWeekDataForExcelDocumentFromDB,
  deleteShiftFromDB,
  getShiftWorkersSuggestionsFromDB,
} = require("../models/ShiftCRUD");
// const { computeOptimalAssignment } = require("../services/assignmentAlgorithm");// old algorithm that allows multiple shifts per day for a worker
const {
  computeOptimalAssignment,
} = require("../services/assignmentAlgorithm2"); // this alrorithm uses day_id for constraints so each worker can work only one shift per day

async function addWeeklyShifts(req, res) {
  const days = req.body;
  const userId = req.user.userId;

  //   console.log(days);
  const result = await addWeekToDB(days, userId);
  if (!result.success) {
    res
      .status(500)
      .json({ message: "Error adding weekly shifts", week_id: res.week_id });
  }
  res.status(200).json({
    message: "Weekly shifts added successfully",
    week_id: result.week_id,
  });
}

async function deleteWeek(req, res) {
  const week_id = req.params.week_id;
  const result = await deleteWeekFromDB(week_id);
  if (!result.success) {
    res.status(500).json({ message: "Error deleting week" });
  }
  res.status(200).json({
    message: "Week deleted successfully",
  });
}

async function addShiftAssignments(req, res) {
  const shift_data = req.body;
  const result = await addShiftDataToDB(shift_data);
  if (!result.success) {
    res.status(500).json({ message: "Error adding shift data" });
  }
  res.status(200).json({
    message: "Shifts data added successfully",
  });
}

async function getAllWeeks(req, res) {
  const userId = req.user.userId;

  const result = await getAllWeeksFromDB(userId);
  if (!result.success) {
    res.status(500).json({ message: "Error fetching weeks" });
  }
  res.status(200).json({ weeks: result.weeks });
}

async function getDaysByWeekId(req, res) {
  const week_id = req.params.week_id;
  const result = await getDaysByWeekIdFromDB(week_id);
  if (!result.success) {
    res.status(500).json({ message: "Error fetching days for the week" });
  }
  res.status(200).json({ days: result.days });
}

async function getShiftsByDayId(req, res) {
  const day_id = req.params.day_id;
  const result = await getShiftsByDayIdFromDB(day_id);
  if (!result.success) {
    res.status(500).json({ message: "Error fetching shifts for the day" });
  }
  res.status(200).json({ shifts: result.shifts });
}

async function getShiftAssignments(req, res) {
  const shift_id = req.params.shift_id;
  const result = await getShiftsAssignmentsFromDB(shift_id);
  if (!result.success) {
    res.status(500).json({ message: "Error fetching shift assignmetns" });
  }
  res.status(200).json({ shift_assignments: result.shift_assignments });
}

async function getEncryptedBossAndWeek(req, res) {
  const week_id = req.params.week_id.toString();
  const userId = req.user.userId.toString();

  const encryptedWeek = encrypt(week_id);
  const encryptedBoss = encrypt(userId);
  res.status(200).json({ encryptedWeek, encryptedBoss });
}

async function smartWeeklyShiftsBuilder(req, res) {
  const week_id = req.params.week_id;
  const user_id = req.user.userId.toString();
  try {
    const optimalAssignments = await computeOptimalAssignment(user_id, week_id);
    // console.log("Optimal Assignments:", optimalAssignments);
    const result = await insertOptimalWeeklyShiftAssignmentsToDB(
      week_id,
      optimalAssignments.assignments
    );
    if (!result.success) {
      res
        .status(500)
        .json({ error: "Failed to insert optimal shift assignments." });
      return;
    }
    res.status(200).json({
      message: "Optimal shift assignments inserted successfully.",
      details: optimalAssignments,
    });
  } catch (error) {
    console.error("Error building weekly shifts:", error);
    res.status(500).json({ error: "Failed to process shift assignments." });
  }
}

async function getWeekDataForExcelDocument(req, res) {
  const week_id = req.params.week_id;
  const result = await getWeekDataForExcelDocumentFromDB(week_id);

  if (!result.success) {
    res.status(500).json({ message: "Error fetching week data for Excel" });
  }
  res.status(200).json({ weekData: result.weekData });
}

async function deleteShift(req, res) {
  const shift_id = req.params.shift_id;
  const result = await deleteShiftFromDB(shift_id);
  if (!result.success) {
    res.status(500).json({ message: "Error deleting shift" });
  }
  res.status(200).json({
    message: "Shift deleted successfully",
  });
}

async function getShiftWorkersSuggestions(req, res) {
  const shift_id = req.params.shift_id;
  
  const result = await getShiftWorkersSuggestionsFromDB(shift_id);
  if (!result.success) {
    res
      .status(500)
      .json({ message: "Error fetching shift workers suggestions" });
  }
  res.status(200).json({ suggestions: result.suggestions });
}

module.exports = {
  addWeeklyShifts,
  deleteWeek,
  getAllWeeks,
  getDaysByWeekId,
  getShiftsByDayId,
  addShiftAssignments,
  getShiftAssignments,
  getEncryptedBossAndWeek,
  smartWeeklyShiftsBuilder,
  getWeekDataForExcelDocument,
  deleteShift,
  getShiftWorkersSuggestions,
};
