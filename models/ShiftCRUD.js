const supabase = require("../supabase");

async function addWeekToDB(days) {
  const start_date = new Date(days[0].date);

  const res = await supabase
    .from("weeks")
    .insert({ start_date })
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

async function getAllWeeksFromDB() {
  const res = await supabase.from("weeks").select("*").order("start_date", { ascending: false });
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

module.exports = { addWeekToDB, getAllWeeksFromDB, getDaysByWeekIdFromDB };
