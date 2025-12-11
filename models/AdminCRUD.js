const supabase = require("../supabase");

async function getAllBossesFromDB() {
  return await supabase
    .from("users")
    .select("id, username, roles")
    .contains("roles", ["boss"]);
}

async function getAllWorkersForBossIdFromDB(bossId) {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      id, 
      username, 
      roles,
      workers!workers_id_fkey!inner ( 
        last_name, 
        email, 
        phone, 
        salary, 
        rank
      )
    `
    )
    .eq("workers.boss_id", bossId); // This filter works because of !inner

  if (error) {
    console.error("Error fetching workers:", error);
    return [];
  }

  // Optional: Flatten the data if you want a clean object
  return data.map((user) => ({
    id: user.id,
    username: user.username,
    roles: user.roles,
    ...user.workers, // Spread the worker details (last_name, etc.)
  }));
}

module.exports = {
  getAllBossesFromDB,
  getAllWorkersForBossIdFromDB,
};
