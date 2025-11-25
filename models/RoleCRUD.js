const supabase = require("../supabase");

async function addRoleToDB(name, desc, boss_id) {
  const { data, error } = await supabase.from("roles").insert([{ name, desc, boss_id }]);
  if (error) {
    console.error("Error adding role:", error);
    return { success: false, error };
  }
  return { success: true, data };
}

async function deleteRoleFromDB(roleId) {
  const { data, error } = await supabase
    .from("roles")
    .delete()
    .eq("id", roleId);
  if (error) {
    console.error("Error deleting role:", error);
    return { success: false, error };
  }
  return { success: true, data };
}

async function getAllRolesFromDB(userId) {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("boss_id", userId);
  if (error) {
    console.error("Error fetching roles:", error);
    return { success: false, error };
  }
  return { success: true, data };
}

module.exports = {
  addRoleToDB,
  getAllRolesFromDB,
  deleteRoleFromDB,
};
