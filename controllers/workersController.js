const { addWorkerToDB, getAllWorkersFromDB } = require("../models/WorkerCRUD");

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

async function getAllWorkers(req, res) {
  const result = await getAllWorkersFromDB();
  res.json({ success: true, data: result.data });
}
module.exports = {
  addWorker,
  getAllWorkers,
};
