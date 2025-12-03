const { loginCheck } = require("../middleware/loggedInCheck");
const {
  addRole,
  getAllRoles,
  deleteRole,
} = require("../controllers/rolesController");

const express = require("express");
const router = express.Router();

router.post("/addRole", loginCheck, addRole);
router.get("/getAllRoles", loginCheck, getAllRoles);
router.delete("/deleteRole/:roleId", loginCheck, deleteRole);

module.exports = router;
