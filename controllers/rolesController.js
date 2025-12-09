const { addRoleToDB, getAllRolesFromDB, deleteRoleFromDB } = require("../models/RoleCRUD");

async function addRole(req, res) {
  const userId = req.user.userId;
  const { name, desc, numOfWorkers } = req.body;
  const result = await addRoleToDB(name, desc, numOfWorkers, userId);

  if (result.success) {
    res
      .status(201)
      .json({ message: "Role added successfully", data: result.data });
  } else {
    res.status(500).json({ message: "Error adding role", error: result.error });
  }
}

async function deleteRole(req, res) {
  const { roleId } = req.params;
  const result = await deleteRoleFromDB(roleId);
  if (result.success) {
    res.status(200).json({ message: "Role deleted successfully" });
  } else {
    res
      .status(500)
      .json({ message: "Error deleting role", error: result.error });
  }
}

async function getAllRoles(req, res) {
  const userId = req.user.userId;
  const result = await getAllRolesFromDB(userId);
  if (result.success) {
    res.status(200).json({ data: result.data });
  } else {
    res
      .status(500)
      .json({ message: "Error retrieving roles", error: result.error });
  }
}

module.exports = {
  addRole,
  getAllRoles,
  deleteRole,
};
