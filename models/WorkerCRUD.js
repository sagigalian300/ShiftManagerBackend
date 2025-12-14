const supabase = require("../supabase");

async function addWorkerToDB(
  userId,
  lastName,
  email,
  phone,
  salary,
  roles,
  rank,
  bossId
) {
  const { data, error } = await supabase
    .from("workers")
    .insert([
      {
        id: userId,
        last_name: lastName,
        email,
        phone,
        salary,
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
  userId,
  worker_id,
  lastName,
  email,
  phone,
  salary,
  roles,
  rank,
  first_name,
  hashedPassword
) {
  // STEP 1: Verify Ownership & Get the User ID
  // We check: Does this worker exist? AND Does this boss own them?
  const { data: workerData, error: fetchError } = await supabase
    .from("workers")
    .select("id") // We need the id to delete the account
    .eq("id", worker_id) // The worker to delete
    .eq("boss_id", userId) // SECURITY: Only find if boss matches
    .single();

  if (fetchError || !workerData) {
    console.error("Delete failed: Worker not found or unauthorized.");
    return {
      success: false,
      error: "Worker not found or you do not have permission.",
    };
  }

  // update in user table
  const targetUserId = workerData.id;
  let e = null;
  if (hashedPassword) {
    const { _, error: userUpdateError } = await supabase
      .from("users")
      .update({
        username: first_name,
        password: hashedPassword,
      })
      .eq("id", targetUserId);
    e = userUpdateError;
  } else {
    const { _, error: userUpdateError } = await supabase
      .from("users")
      .update({
        username: first_name,
      })
      .eq("id", targetUserId);
    e = userUpdateError;
  }
  if (e) {
    console.log("Error updating user details:", e);
    return { success: false, error: e };
  }

  // update in worker table
  const { data, error } = await supabase
    .from("workers")
    .update({
      last_name: lastName,
      email,
      phone,
      salary,
      rank,
    })
    .eq("id", targetUserId);

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
      users!workers_id_fkey (
        first_name: username
      ),
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

  // --- THIS IS THE FIX ---
  const transformed = data.map((worker) => {
    return {
      // 1. Spread the existing worker fields (id, last_name, salary...)
      ...worker,

      // 2. FLATTEN: Pull 'first_name' out of the 'users' object
      // We use optional chaining (?.) in case 'users' is null
      first_name: worker.users?.first_name || "Unknown",

      // 3. FLATTEN: Fix the roles array while we are here
      roles: worker.worker_roles.map((wr) => wr.roles),

      // 4. CLEANUP: Remove the nested objects so they don't clutter your response
      users: undefined,
      worker_roles: undefined,
    };
  });

  return { success: true, data: transformed };
}

async function deleteWorkerFromDB(workerId, bossId) {
  // STEP 1: Verify Ownership & Get the User ID
  // We check: Does this worker exist? AND Does this boss own them?
  const { data: workerData, error: fetchError } = await supabase
    .from("workers")
    .select("id") // We need the id to delete the account
    .eq("id", workerId) // The worker to delete
    .eq("boss_id", bossId) // SECURITY: Only find if boss matches
    .single();

  if (fetchError || !workerData) {
    console.error("Delete failed: Worker not found or unauthorized.");
    return {
      success: false,
      error: "Worker not found or you do not have permission.",
    };
  }

  const targetUserId = workerData.id;

  // STEP 2: Delete the USER (The Parent)
  // Because you set up Foreign Keys with 'ON DELETE CASCADE',
  // deleting the User will automatically delete the Worker profile.
  const { error: deleteError } = await supabase
    .from("users")
    .delete()
    .eq("id", targetUserId);

  if (deleteError) {
    console.error("Error deleting user:", deleteError);
    return { success: false, error: deleteError };
  }

  return { success: true, data: "Worker account deleted successfully" };
}

async function getWorkerByNameAndBossIdFromDB(name, boss_id) {
  const { data, error } = await supabase
    .from("workers")
    .select(
      `
      *,
      users!workers_id_fkey!inner (
        first_name: username,
        password,
        roles
      )
    `
    )
    .eq("boss_id", boss_id)
    .eq("users.username", name);

  if (error) {
    console.log("Error logging in worker:", error);
    return { success: false, worker: null, error };
  }
  if (!data || data.length === 0) {
    return { success: false, worker: null, error: "Invalid credentials" };
  }

  // --- FLATTENING LOGIC ---
  const rawWorker = data[0];

  const flattenedWorker = {
    ...rawWorker,
    first_name: rawWorker.users?.first_name,
    password: rawWorker.users?.password,
    roles: rawWorker.users?.roles,
  };

  return { success: true, worker: flattenedWorker };
}

async function getWorkerRolesFromDB(userId) {
  const { data, error } = await supabase
    .from("worker_roles") // 1. Start from the table that has the columns you want (worker_id, role_id)
    .select(
      `
      worker_id,
      role_id,
      workers!inner (
        boss_id
      )
    `
    )
    .eq("workers.boss_id", userId);

  if (error) {
    console.error("Error fetching roles:", error);
    return [];
  }

  const formattedData = data.map((row) => ({
    user_id: row.workers.boss_id,
    worker_id: row.worker_id,
    role_id: row.role_id,
  }));

  return formattedData;
}

async function getWorkerNameById(workerId) {
  const { data, error } = await supabase
    .from("workers")
    .select(
      `
      last_name,
      users!workers_id_fkey (
        first_name: username
      )
    `
    )
    .eq("id", workerId)
    .single();

  if (error) {
    console.error("Error fetching worker name:", error);
    return { success: false, error };
  }

  // --- FLATTENING LOGIC ---
  // Since .single() returns one object (not an array), we just create a new clean object.
  const flattenedData = {
    last_name: data.last_name,
    first_name: data.users?.first_name || "Unknown",
  };

  return { success: true, data: flattenedData };
}

module.exports = {
  addWorkerToDB,
  getAllWorkersFromDB,
  updateWorkerDetailsToDB,
  deleteWorkerFromDB,
  getWorkerByNameAndBossIdFromDB,
  getWorkerRolesFromDB,
  getWorkerNameById,
};
