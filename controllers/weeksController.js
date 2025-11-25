const {
  addWeekToDB,
  getAllWeeksFromDB,
  getDaysByWeekIdFromDB,
  getShiftsByDayIdFromDB,
  addShiftDataToDB,
  getShiftsAssignmentsFromDB,
} = require("../models/ShiftCRUD");

async function addWeeklyShifts(req, res) {
  const days = req.body;
  const userId = req.userId;

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
  const userId = req.userId;

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

module.exports = {
  addWeeklyShifts,
  getAllWeeks,
  getDaysByWeekId,
  getShiftsByDayId,
  addShiftAssignments,
  getShiftAssignments,
};
