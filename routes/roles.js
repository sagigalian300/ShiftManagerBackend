const {
  addRole,
  getAllRoles,
  deleteRole,
} = require("../controllers/rolesController");

const express = require("express");
const router = express.Router();

router.post("/addRole", addRole);
router.get("/getAllRoles", getAllRoles);
router.delete("/deleteRole/:roleId", deleteRole);

module.exports = router;
