// const { loginCheck } = require("../middleware/loggedInCheck");
const { authorize } = require("../middleware/authorization");
const { authenticate } = require("../middleware/authentication");
const {
  addRole,
  getAllRoles,
  deleteRole,
  updateRole,
} = require("../controllers/rolesController");

const express = require("express");
const router = express.Router();

router.post("/addRole", authenticate, authorize(["boss"]), addRole);
router.get("/getAllRoles", authenticate, authorize(["boss"]), getAllRoles);
router.delete(
  "/deleteRole/:roleId",
  authenticate,
  authorize(["boss"]),
  deleteRole
);
router.put(
  "/updateRole/:roleId",
  authenticate,
  authorize(["boss"]),
  updateRole
);

module.exports = router;
