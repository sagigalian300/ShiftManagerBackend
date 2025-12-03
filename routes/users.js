const {login, logout, getAllUsers, register} = require("../controllers/usersController");

const express = require("express");
const router = express.Router();

router.post("/register", register)
router.post("/login", login);
router.post("/logout", logout);
router.get("/getAllUsers", getAllUsers);

module.exports = router;
