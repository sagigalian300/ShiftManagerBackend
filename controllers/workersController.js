const { Hasher } = require("../auth/symmetricalEncryption/hasher");
const jwt = require("jsonwebtoken");
const {
  addWorkerToDB,
  getAllWorkersFromDB,
  updateWorkerDetailsToDB,
  deleteWorkerFromDB,
  workerLoginToDB,
} = require("../models/WorkerCRUD");

async function addWorker(req, res) {
  const { firstName, lastName, email, phone, salary, roles, password, rank } =
    req.body;

  const result = await addWorkerToDB(
    firstName,
    lastName,
    email,
    phone,
    salary,
    roles,
    password,
    rank
  );
  res.json({ success: true, data: result.data });
}

async function updateWorkerDetails(req, res) {
  const {
    worker_id,
    first_name,
    last_name,
    email,
    phone,
    salary,
    roles,
    password,
    rank,
  } = req.body;

  const result = await updateWorkerDetailsToDB(
    worker_id,
    first_name,
    last_name,
    email,
    phone,
    salary,
    roles,
    password,
    rank
  );
  res.json({ success: true, data: result.data });
}

async function getAllWorkers(req, res) {
  const userId = req.userId;

  const result = await getAllWorkersFromDB(userId);
  res.json({ success: true, data: result.data });
}

async function deleteWorker(req, res) {
  const workerId = req.params.workerId;

  if (!workerId) {
    return res
      .status(400)
      .json({ success: false, message: "Worker ID is required." });
  }

  const result = await deleteWorkerFromDB(workerId);

  // 2. Implement proper error handling based on the result from DB function
  if (!result.success) {
    // Respond with a 500 Internal Server Error if the DB operation failed
    console.error(
      "Failed to delete worker from DB:",
      result.error || result.e1 || result.e2 || result.e3
    );
    return res.status(500).json({
      success: false,
      message: "An error occurred during worker deletion.",
    });
  }

  // Respond with a 200 OK status on success
  res.status(200).json({
    success: true,
    message: "Worker and associated data successfully deleted.",
    data: result.data,
  });
}

async function workerLogin(req, res) {
  const { name, password, encrypted_boss_id, encrypted_week_id } = req.body;
  const boss_id = Hasher.decrypt(encrypted_boss_id.toString());
  const week_id = Hasher.decrypt(encrypted_week_id.toString());

  const result = await workerLoginToDB(name, password, boss_id);

  if (!result.success) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials." });
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  const worker_token = jwt.sign(
    {
      workerId: result.data[0].id,
      bossId: result.data[0].boss_id,
      weekId: week_id,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.cookie("worker_auth_token", worker_token, { httpOnly: true });

  res.json({ success: true, message: "successfully worker login" });
}

module.exports = {
  addWorker,
  getAllWorkers,
  updateWorkerDetails,
  deleteWorker,
  workerLogin,
};
