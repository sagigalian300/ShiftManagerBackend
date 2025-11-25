const jwt = require("jsonwebtoken");
const { getAllUsersFromDB, getUserByUsername } = require("../models/UserCRUD");

const JWT_SECRET = process.env.JWT_SECRET;

async function logout(req, res) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  return res.json({ success: true, message: "Logged out" });
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const { user } = await getUserByUsername(username);

    if (password !== user.password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password." });
    }

    // Create the payload (what stored in the token)
    const payload = {
      userId: user.id,
    };
    // Sign the token
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d",
    });
    // Set cookie
    return res
      .cookie("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24, // Matches JWT expiration (1 day)
      })
      .json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
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
  logout,
};
