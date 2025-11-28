const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

async function workerLoginCheck(req, res, next) {
  const token = req.cookies.worker_auth_token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token missing. Access denied.",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.workerId = decoded.workerId;
    req.userId = decoded.bossId;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}

module.exports = { workerLoginCheck };
