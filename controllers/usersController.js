const jwt = require("jsonwebtoken");
const {
  getUserByUsername,
  getUserCountFromDB,
  createUserInDB,
} = require("../models/UserCRUD");
const { hash, verify } = require("../services/hasher");

const JWT_SECRET = process.env.JWT_SECRET;

async function register(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }
    // check whether this is the first user ever => make admin
    const userCount = await getUserCountFromDB();
    let roles = [];

    if (userCount === 0) {
      roles = ["admin", "boss"];
    } else {
      roles = ["boss"];
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser.user) {
      return res.json({
        success: false,
        message: "Username already exists.",
      });
    }
    const hashedPassword = await hash(password);
    const success = await createUserInDB(username, hashedPassword, roles);
    return res.status(201).json({
      success,
      message: "User registered successfully.",
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

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

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password." });
    }

    const passwordMatch = await verify(user.password, password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password." });
    }

    // Create the payload (what stored in the token)
    const payload = {
      userId: user.id,
      roles: user.roles,
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
        partitioned: true,
      })
      .json({ success: true, token: token, message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

module.exports = {
  login,
  logout,
  register,
};
