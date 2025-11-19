const supabase = require("../supabase");

async function addWorkerToDB(firstName, lastName, email, phone, salary, roles) {
  const { data, error } = await supabase
    .from("workers")
    .insert([
      {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        salary,
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

async function getAllWorkersFromDB() {
  const { data, error } = await supabase.from("workers").select(`
      *,
      worker_roles (
        roles (
          id,
          name,
          desc
        )
      )
    `);

  if (error) {
    console.log("Error fetching workers:", error);
    return { success: false, error };
  }

  // Transform the data to have a "roles" array directly in the worker object
  const transformed = data.map((worker) => ({
    ...worker,
    roles: worker.worker_roles.map((wr) => wr.roles),
  }));

  console.log(transformed);
  return { success: true, data: transformed };
}

module.exports = { addWorkerToDB, getAllWorkersFromDB };
