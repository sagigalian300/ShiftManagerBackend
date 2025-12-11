const { decrypt } = require("../services/symmetricalEncryption/encryptor");
const jwt = require("jsonwebtoken");
const {
  addWorkerToDB,
  getAllWorkersFromDB,
  updateWorkerDetailsToDB,
  deleteWorkerFromDB,
  getWorkerByNameAndBossIdFromDB,
} = require("../models/WorkerCRUD");
const { hash, verify } = require("../services/hasher");
const { createUserInDB } = require("../models/UserCRUD");

async function addWorker(req, res) {
  const {
    firstName,
    lastName,
    email,
    phone,
    salary,
    roles,
    password,
    rank,
  } = req.body;
  const hashedPassword = await hash(password);
  const bossId = req.user.userId;

  const { success, userId } = await createUserInDB(
    firstName,
    hashedPassword,
    ["worker"]
  );
  if (!success) {
    return res.status(500).json({
      success: false,
      message: "Error creating worker (user) account.",
    });
  }

  const result = await addWorkerToDB(
    userId,
    lastName,
    email,
    phone,
    salary,
    roles,
    rank,
    bossId
  );
  res.json({ success: true, data: result.data });
}

async function updateWorkerDetails(req, res) {
  const userId = req.user.userId;

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

  let hashedPassword = null;
  if (password.length > 0) {
    hashedPassword = await hash(password);
  }

  const result = await updateWorkerDetailsToDB(
    userId,
    worker_id,
    last_name,
    email,
    phone,
    salary,
    roles,
    rank,
    first_name,
    hashedPassword
  );
  res.json({ success: true, data: result.data });
}

async function getAllWorkers(req, res) {
  const userId = req.user.userId;

  const result = await getAllWorkersFromDB(userId);
  res.json({ success: true, data: result.data });
}

async function deleteWorker(req, res) {
  const workerId = req.params.workerId;
  const userId = req.user.userId;

  if (!workerId) {
    return res
      .status(400)
      .json({ success: false, message: "Worker ID is required." });
  }

  const result = await deleteWorkerFromDB(Number(workerId), userId);

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
  const boss_id = decrypt(encrypted_boss_id.toString());
  const week_id = decrypt(encrypted_week_id.toString());

  const result = await getWorkerByNameAndBossIdFromDB(name, boss_id);
  // console.log("Worker login result:", result);
  if (!result.success) {
    return res.json({ success: false, message: "Invalid credentials." });
  }

  const passwordMatch = await verify(result.worker.password, password);

  if (!passwordMatch) {
    return res.json({ success: false, message: "Invalid credentials." });
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  const worker_token = jwt.sign(
    {
      workerId: result.worker.id,
      bossId: result.worker.boss_id,
      weekId: week_id,
      roles: result.worker.roles,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res
    .cookie("auth_token", worker_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 1000 * 60 * 60 * 1, // Matches JWT expiration (1 hour)
    })
    .json({ success: true, message: "successfully worker login" });
}

module.exports = {
  addWorker,
  getAllWorkers,
  updateWorkerDetails,
  deleteWorker,
  workerLogin,
};
