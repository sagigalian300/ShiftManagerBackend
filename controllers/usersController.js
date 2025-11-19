const {getAllUsersFromDB, getUserByUsername} = require("../models/UserCRUD");

async function login(req, res) {
  try {
    const { username, password } = req.body;

    // 1️⃣ Validate input
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    // 2️⃣ Fetch user from database
    const { user } = await getUserByUsername(username);

    // 3️⃣ Compare plain-text passwords
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: "Invalid username or password." });
    }

    // 4️⃣ Login successful
    return res.json({ success: true, message: "Login successful", userId: user.id });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function getAllUsers(req, res) {
  const result = await getAllUsersFromDB();
  console.log(result.data);
  res.json({ success: true, data: result.data });
}

module.exports = {
  login,
  getAllUsers,
};
