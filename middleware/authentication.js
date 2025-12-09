const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * 1. AUTHENTICATION MIDDLEWARE
 * Verifies the token exists and is valid.
 * Attaches the decoded user to req.user
 */
const authenticate = (req, res, next) => {
  // Check for token in a standard cookie name (recommend using just one name like 'token' or 'session'):
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied: No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach the ENTIRE payload to req.user
    // Now req.user.id, req.user.roles, req.user.bossId are all available
    req.user = decoded; 
    
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token.",
    });
  }
};

module.exports = {authenticate};