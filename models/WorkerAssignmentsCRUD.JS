const supabase = require("../supabase");

async function getWeekToAssignToFromDB(weekId) {
  try {
    // 1. Get week details
    const { data: weekData, error: weekError } = await supabase
      .from("weeks")
      .select("id, start_date")
      .eq("id", weekId)
      .single();

    if (weekError || !weekData) {
      return { success: false, error: weekError?.message || "Week not found" };
    }

    // 2. Get days for this week, ordered by date
    const { data: daysData, error: daysError } = await supabase
      .from("days")
      .select("id, date, date_name")
      .eq("week_id", weekId)
      .order("date", { ascending: true });

    if (daysError) {
      return { success: false, error: daysError.message };
    }

    // 3. Get all shifts for these days
    const dayIds = daysData.map((day) => day.id);
    const { data: shiftsData, error: shiftsError } = await supabase
      .from("shifts")
      .select("id, day_id, type, start_time, end_time")
      .in("day_id", dayIds)
      .order("type", { ascending: true }); // 0s before 1s

    if (shiftsError) {
      return { success: false, error: shiftsError.message };
    }

    // 4. Build the response object
    const days = daysData.map((day) => ({
      dayId: day.id,
      date: day.date,
      dateName: day.date_name,
      shifts: shiftsData
        .filter((shift) => shift.day_id === day.id)
        .map((shift) => ({
          shift_id: shift.id,
          type: shift.type,
          start_time: shift.start_time,
          end_time: shift.end_time,
        })),
    }));

    const result = {
      weekId: weekData.id,
      startDate: weekData.start_date,
      days: days,
    };

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


async function addWorkerSuggestedAssignmentToDB(suggestion, workerId) {
  try {
    if (!workerId) {
      return { success: false, error: "workerId parameter is required" };
    }

    // Accept possible shapes for the suggestion payload
    const selectedByDay = suggestion.selectedByDay;

    // Remove previous suggestions for this worker to avoid duplicates / allow updates
    const { error: deleteError } = await supabase
      .from("worker_suggestions_assignment")
      .delete()
      .eq("worker_id", workerId);

    if (deleteError) {
      return { success: false, error: deleteError.message || deleteError };
    }

    // Flatten selected shifts into rows for insertion
    const rows = selectedByDay.flatMap((day) =>
      (day.shifts || []).map((s) => {
        const shiftId = s.id ?? s.shift_id ?? s.shiftId;
        return { worker_id: workerId, shift_id: shiftId };
      })
    );

    if (rows.length === 0) {
      return {
        success: true,
        data: [],
        message: "No suggested shifts to insert",
      };
    }

    const { data, error } = await supabase
      .from("worker_suggestions_assignment")
      .insert(rows);

    if (error) {
      return { success: false, error: error.message || error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || error };
  }
}


module.exports = {
  getWeekToAssignToFromDB,
  addWorkerSuggestedAssignmentToDB,
};
