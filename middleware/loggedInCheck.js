const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// This middleware checks for a valid token BEFORE the route handler runs.
async function loginCheck(req, res, next) {
  // Get the JWT from the cookie
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token missing. Access denied.",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach the userId to the request object for use in subsequent handlers
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}
module.exports = {
  loginCheck, 
};
