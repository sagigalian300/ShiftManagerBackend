const {
  getAllBossesFromDB,
  getAllWorkersForBossIdFromDB,
} = require("../models/AdminCRUD");

async function getAllBosses(req, res) {
  const result = await getAllBossesFromDB();
  res.json({ success: true, data: result.data });
}

async function getAllWorkersForBossId(req, res) {
  const bossId = req.params.bossId;
  const result = await getAllWorkersForBossIdFromDB(bossId);
  res.json({ success: true, data: result });
}

module.exports = {
  getAllBosses,
  getAllWorkersForBossId,
};
