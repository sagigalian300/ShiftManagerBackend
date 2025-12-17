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

async function deleteWeekFromDB(week_id) {
  const res = await supabase.from("weeks").delete().eq("id", week_id);
  if (res.error) {
    console.error("Error deleting week:", res.error);
    return { success: false };
  }
  return { success: true };
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

async function deleteAllShiftsAssignmentsByShiftIds(shiftIds) {
  // shiftIds should be an array, e.g., [134, 135, 136]
  return await supabase
    .from("shift_assignments")
    .delete()
    .in("shift_id", shiftIds);
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
    const deleteRes = await deleteAllShiftsAssignmentsByShiftIds([shift_id]);

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
        last_name,
        email,
        users!workers_id_fkey (
          first_name: username
        )
      )
    `
    )
    .eq("shift_id", shift_id);

  if (res.error) {
    console.error("Error fetching shift assignments", res.error);
    return { success: false, shift_assignments: [] };
  }

  // Group by role_id AND flatten the user data
  const grouped = res.data.reduce((acc, curr) => {
    // 1. Flatten the Worker Object
    // "curr.workers" contains the nested "users" object. We need to unwrap it.
    const rawWorker = curr.workers;

    // Safety check: if worker is null (e.g. deleted), skip or handle gracefully
    if (!rawWorker) return acc;

    const flatWorker = {
      id: rawWorker.id,
      last_name: rawWorker.last_name,
      email: rawWorker.email,
      // Pull the name from the nested 'users' object
      first_name: rawWorker.users?.first_name || "Unknown",
    };

    // 2. Grouping Logic
    const roleEntry = acc.find((r) => r.role_id === curr.role_id);

    if (roleEntry) {
      roleEntry.workers.push(flatWorker);
    } else {
      acc.push({ role_id: curr.role_id, workers: [flatWorker] });
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

/* 
  This function will REMOVE all existing shift assignments for the given week_id
  and INSERT the new optimal assignments provided.
*/
async function insertOptimalWeeklyShiftAssignmentsToDB(
  week_id,
  optimalAssignments
) {
  const shiftIds = [];
  const recordsToInsert = Object.entries(optimalAssignments).flatMap(
    ([key, assignmentsArray]) => {
      const currentShiftId = parseInt(key);
      shiftIds.push(currentShiftId);
      return assignmentsArray
        .filter(
          (item) =>
            item.worker_id != null &&
            item.role_id != null &&
            !isNaN(currentShiftId) // Check if shift_id is a valid number
        )
        .map((item) => ({
          shift_id: currentShiftId,
          role_id: item.role_id,
          worker_id: item.worker_id,
        }));
    }
  );
  const deleteRes = await deleteAllShiftsAssignmentsByShiftIds(shiftIds);
  if (deleteRes.error) {
    console.error(
      "Error deleting old shift assignments for week:",
      deleteRes.error
    );
    return { success: false };
  }
  const insertRes = await supabase
    .from("shift_assignments")
    .insert(recordsToInsert);
  if (insertRes.error) {
    console.error(
      "Error inserting optimal shift assignments:",
      insertRes.error
    );
    return { success: false };
  }
  return { success: true };
}

async function getWeekDataForExcelDocumentFromDB(week_id) {
  const { data, error } = await supabase
    .from("weeks")
    .select(
      `
      start_date,
      days!inner (
        date_name,
        date,
        shifts!inner (
          start_time,
          end_time,
          type,
          shift_assignments!inner (
            roles (name),
            workers (
              last_name,
              users!workers_id_fkey (
                first_name: username
              )
            )
          )
        )
      )
    `
    )
    .eq("id", week_id)
    .order("date", { foreignTable: "days", ascending: true });

  if (error) {
    console.error("Error fetching week data:", error);
    return { success: false, error };
  }

  // If no week found, return early
  if (!data || data.length === 0) {
    return { success: false, error: "Week not found" };
  }

  const weekData = data[0];

  // --- DEEP FLATTENING ---
  // We need to drill down into days -> shifts -> assignments to fix the worker object
  if (weekData.days) {
    weekData.days.forEach((day) => {
      if (day.shifts) {
        day.shifts.forEach((shift) => {
          if (shift.shift_assignments) {
            shift.shift_assignments.forEach((assignment) => {
              const worker = assignment.workers;
              if (worker) {
                // Flatten the name
                worker.first_name = worker.users?.first_name || "Unknown";
                // Remove the nested object
                delete worker.users;
              }
            });
          }
        });
      }
    });
  }

  return { success: true, weekData };
}

async function deleteShiftFromDB(shift_id) {
  const res = await supabase.from("shifts").delete().eq("id", shift_id);
  if (res.error) {
    console.error("Error deleting shift:", res.error);
    return { success: false };
  }
  return { success: true };
}

module.exports = {
  addWeekToDB,
  deleteWeekFromDB,
  getAllWeeksFromDB,
  getDaysByWeekIdFromDB,
  getShiftsByDayIdFromDB,
  addShiftDataToDB,
  getShiftsAssignmentsFromDB,
  getShiftsForWeekFromDB,
  insertOptimalWeeklyShiftAssignmentsToDB,
  getWeekDataForExcelDocumentFromDB,
  deleteShiftFromDB,
};
