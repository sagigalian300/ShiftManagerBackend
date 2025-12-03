const supabase = require("../supabase");

async function addWeekToDB(days, userId) {
  const start_date = new Date(days[0].date);

  const res = await supabase
    .from("weeks")
    .insert({ start_date, boss_id: userId })
    .select()
    .single();

  if (res.error) {
    console.error("Error adding week:", res.error);
    return { success: false, week_id: null };
  }
  const week_id = res.data.id;

  const daysSuccess = await addDaysToDB(week_id, days);
  if (!daysSuccess) {
    console.error("Error adding days for week:", week_id);
    return { success: false, week_id: null };
  }
  return { success: true, week_id };
}

async function addDaysToDB(week_id, days) {
  const daysToInsert = days.map((day) => ({
    week_id,
    date_name: day.name,
    date: new Date(day.date),
  }));

  const res = await supabase.from("days").insert(daysToInsert).select();
  if (res.error) {
    console.error("Error adding days:", res.error);
    return false;
  }

  const shiftsSuccess = await addShiftsToDB(res.data);
  if (!shiftsSuccess) {
    console.error("Error adding shifts for days in week:", week_id);
    return false;
  }

  return true;
}

async function addShiftsToDB(days) {
  const shiftsToInsert = days.flatMap((day) => [
    {
      day_id: day.id,
      type: 0,
      start_time: "08:00",
      end_time: "15:00",
    },
    {
      day_id: day.id,
      type: 1,
      start_time: "15:00",
      end_time: "22:00",
    },
  ]);

  const res = await supabase.from("shifts").insert(shiftsToInsert).select();
  if (res.error) {
    console.error("Error adding shifts:", res.error);
    return false;
  }
  return true;
}

async function addShiftDataToDB(shift_data) {
  const { shift_id, shift_assignments } = shift_data;

  // Flatten all workers inside the nested arrays
  const rowsToInsert = shift_assignments
    .flat() // turns [ [worker], [], [worker], ... ] → [worker, worker]
    .map((worker) => ({
      shift_id: shift_id,
      worker_id: worker.id,
      role_id: worker.choosenRole,
    }));

  try {
    // Start a transaction-like flow: delete old rows first
    const deleteRes = await supabase
      .from("shift_assignments")
      .delete()
      .eq("shift_id", shift_id);

    if (deleteRes.error) {
      console.error("Error deleting old shift assignments:", deleteRes.error);
      return { success: false };
    }

    // If nothing to insert, return success
    if (rowsToInsert.length === 0) {
      return { success: true };
    }

    // Insert the new assignments
    const insertRes = await supabase
      .from("shift_assignments")
      .insert(rowsToInsert)
      .select();

    if (insertRes.error) {
      console.error("Error adding shift assignments:", insertRes.error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false };
  }
}

async function getAllWeeksFromDB(userId) {
  const res = await supabase
    .from("weeks")
    .select("*")
    .eq("boss_id", userId)
    .order("start_date", { ascending: false });
  if (res.error) {
    console.error("Error fetching weeks:", res.error);
    return { success: false, weeks: [] };
  }
  return { success: true, weeks: res.data };
}

async function getDaysByWeekIdFromDB(week_id) {
  const res = await supabase
    .from("days")
    .select("*")
    .eq("week_id", week_id)
    .order("date", { ascending: true });
  if (res.error) {
    console.error("Error fetching days by week ID:", res.error);
    return { success: false, days: [] };
  }
  return { success: true, days: res.data };
}

async function getShiftsByDayIdFromDB(day_id) {
  const res = await supabase
    .from("shifts")
    .select("*")
    .eq("day_id", day_id)
    .order("type");
  if (res.error) {
    console.error("Error fetching shifts by day ID:", res.error);
    return { success: false, shifts: [] };
  }
  return { success: true, shifts: res.data };
}

async function getShiftsAssignmentsFromDB(shift_id) {
  const res = await supabase
    .from("shift_assignments")
    .select(
      `
      role_id,
      workers:worker_id (
        id,
        first_name,
        last_name,
        email
      )
    `
    )
    .eq("shift_id", shift_id);

  if (res.error) {
    console.error("Error fetching shift assignments", res.error);
    return { success: false, shift_assignments: [] };
  }

  // Group by role_id
  const grouped = res.data.reduce((acc, curr) => {
    const roleEntry = acc.find((r) => r.role_id === curr.role_id);
    if (roleEntry) {
      roleEntry.workers.push(curr.workers);
    } else {
      acc.push({ role_id: curr.role_id, workers: [curr.workers] });
    }
    return acc;
  }, []);

  return { success: true, shift_assignments: grouped };
}

async function getShiftsForWeekFromDB(week_id) {
  const { data, error } = await supabase
    .from("shifts")
    // 1. Force an INNER JOIN on the 'days' table
    //    and apply the filter to the joined table
    .select("*, days!inner(*)")
    .eq("days.week_id", week_id);

  if (error) {
    console.error("Error fetching shifts:", error);
    return null;
  }
  return data;
}

module.exports = {
  addWeekToDB,
  getAllWeeksFromDB,
  getDaysByWeekIdFromDB,
  getShiftsByDayIdFromDB,
  addShiftDataToDB,
  getShiftsAssignmentsFromDB,
  getShiftsForWeekFromDB,
};
