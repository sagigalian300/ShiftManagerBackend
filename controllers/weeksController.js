const {
  addWeekToDB,
  getAllWeeksFromDB,
  getDaysByWeekIdFromDB,
} = require("../models/ShiftCRUD");

async function addWeeklyShifts(req, res) {
  const days = req.body;
  //   console.log(days);
  const result = await addWeekToDB(days);
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

async function getAllWeeks(req, res) {
  const result = await getAllWeeksFromDB();
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

module.exports = { addWeeklyShifts, getAllWeeks, getDaysByWeekId };
