const {login, logout, getAllUsers} = require("../controllers/usersController");

const express = require("express");
const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/getAllUsers", getAllUsers);

module.exports = router;
