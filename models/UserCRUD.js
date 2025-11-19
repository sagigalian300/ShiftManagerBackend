const supabase = require("../supabase");

async function getAllUsersFromDB() {
  return await supabase.from("users").select("*");
}

async function getUserByUsername(username) {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, password")
    .eq("username", username)
    .limit(1);

  if (error) {
    console.error("Database error:", error);
    return { user: null, error };
  }
  return { user: data[0] };
}
module.exports = {
  getAllUsersFromDB,
  getUserByUsername,
};
