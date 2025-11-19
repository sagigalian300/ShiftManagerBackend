const {login, getAllUsers} = require("../controllers/usersController");

const express = require("express");
const router = express.Router();

router.post("/login", login);
router.get("/getAllUsers", getAllUsers);
module.exports = router;
