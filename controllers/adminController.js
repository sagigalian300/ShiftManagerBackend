const {
  getAllBossesFromDB,
  getAllWorkersForBossIdFromDB,
  deleteBossFromDB,
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

async function deleteBoss(req, res) {
  const bossId = req.params.bossId;
  const result = await deleteBossFromDB(bossId);
  if (result.success) {
    res.json({
      success: true,
      data: `Boss with ID ${bossId} deleted successfully.`,
    });
  } else {
    res.status(500).json({
      success: false,
      data: `Failed to delete boss with ID ${bossId}.`,
    });
  }
}

module.exports = {
  getAllBosses,
  getAllWorkersForBossId,
  deleteBoss,
};
