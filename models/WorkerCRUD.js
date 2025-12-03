const { Hasher } = require("../services/symmetricalEncryption/encryptor");
const supabase = require("../supabase");

async function addWorkerToDB(
  firstName,
  lastName,
  email,
  phone,
  salary,
  roles,
  password,
  rank,
  bossId
) {
  const { data, error } = await supabase
    .from("workers")
    .insert([
      {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        salary,
        password,
        rank,
        boss_id: bossId,
      },
    ])
    .select();

  if (error) {
    console.log("Error adding worker:", error);
    return { success: false, error };
  }

  // Assign roles
  const { data: insertedRoles, error: error2 } = await supabase
    .from("worker_roles")
    .insert(
      roles.map((role) => ({
        worker_id: data[0].id,
        role_id: role.id,
      }))
    );

  if (error2) {
    console.log("Error assigning roles to worker:", error2);
    return { success: false, error: error2 };
  }

  return { success: true };
}

async function updateWorkerDetailsToDB(
  worker_id,
  firstName,
  lastName,
  email,
  phone,
  salary,
  roles,
  password,
  rank
) {
  // 1) Update worker basic details
  const { data, error } = await supabase
    .from("workers")
    .update({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      salary,
      password,
      rank,
    })
    .eq("id", worker_id)
    .select();

  if (error) {
    console.log("Error updating worker:", error);
    return { success: false, error };
  }

  // 2) Remove old roles
  const { error: deleteError } = await supabase
    .from("worker_roles")
    .delete()
    .eq("worker_id", worker_id);

  if (deleteError) {
    console.log("Error removing previous roles:", deleteError);
    return { success: false, error: deleteError };
  }

  // 3) Insert updated roles
  const { error: roleError } = await supabase.from("worker_roles").insert(
    roles.map((role) => ({
      worker_id: worker_id,
      role_id: role.id,
    }))
  );

  if (roleError) {
    console.log("Error assigning new roles:", roleError);
    return { success: false, error: roleError };
  }
  return { success: true };
}

async function getAllWorkersFromDB(userId) {
  const { data, error } = await supabase
    .from("workers")
    .select(
      `
      *,
      worker_roles (
        roles (
          id,
          name,
          desc
        )
      )
    `
    )
    .eq("boss_id", userId);

  if (error) {
    console.log("Error fetching workers:", error);
    return { success: false, error };
  }

  // Transform the data to have a "roles" array directly in the worker object
  const transformed = data.map((worker) => ({
    ...worker,
    roles: worker.worker_roles.map((wr) => wr.roles),
  }));

  return { success: true, data: transformed };
}

async function deleteWorkerFromDB(workerId) {
  // Database automatically handles deletion in worker_roles and shift_assignments
  const { data, error } = await supabase
    .from("workers")
    .delete()
    .eq("id", workerId);

  if (error) {
    console.error("Error deleting worker:", error);
    return { success: false, error };
  }
  return { success: true, data: "Worker successfully deleted" };
}

async function getWorkerByNameAndBossIdFromDB(name, boss_id) {
  const { data, error } = await supabase.from("workers").select().match({
    first_name: name,
    boss_id,
  });

  if (error) {
    console.log("Error logging in worker:", error);
    return { success: false, error };
  }
  if (data.length === 0) {
    return { success: false, worker: null, error: "Invalid credentials" };
  }

  return { success: true, worker: data[0] };
}

module.exports = {
  addWorkerToDB,
  getAllWorkersFromDB,
  updateWorkerDetailsToDB,
  deleteWorkerFromDB,
  getWorkerByNameAndBossIdFromDB,
};
