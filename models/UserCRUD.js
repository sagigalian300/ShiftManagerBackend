const supabase = require("../supabase");

async function createUserInDB(username, hashedPassword, isAdmin = false) {
  const { data, error } = await supabase.from("users").insert([
    {
      username,
      password: hashedPassword,
      is_admin: isAdmin,
    },
  ]);

  if (error) {
    console.error("Error creating user:", error);
    return null;
  }

  return { success: true };
}

async function getUserCountFromDB() {
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });
  if (error) {
    console.error("Error fetching user count:", error);
    return null;
  }

  return count;
}

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
  getUserCountFromDB,
  createUserInDB,
};
