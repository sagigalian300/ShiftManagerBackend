const { addWorkerToDB, getAllWorkersFromDB, updateWorkerDetailsToDB } = require("../models/WorkerCRUD");

async function addWorker(req, res) {
  const { firstName, lastName, email, phone, salary, roles } = req.body;

  const result = await addWorkerToDB(
    firstName,
    lastName,
    email,
    phone,
    salary,
    roles
  );
  res.json({ success: true, data: result.data });
}

async function updateWorkerDetails(req, res) {
  const { worker_id, first_name, last_name, email, phone, salary, roles } = req.body;

  const result = await updateWorkerDetailsToDB(
    worker_id,
    first_name,
    last_name,
    email,
    phone,
    salary,
    roles
  );
  res.json({ success: true, data: result.data });
}

async function getAllWorkers(req, res) {
  const userId = req.userId;

  const result = await getAllWorkersFromDB(userId);
  res.json({ success: true, data: result.data });
}
module.exports = {
  addWorker,
  getAllWorkers,
  updateWorkerDetails,
};
