const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * 2. AUTHORIZATION MIDDLEWARE
 * Returns a function that checks if the user has one of the allowed roles.
 * Usage: authorize(['admin', 'boss'])
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    // Ensure the user was authenticated first

    // console.log("User Actual Roles:", req.user.roles);

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const userRoles = req.user.roles || [];
    // Check if the user has at least one of the allowed roles
    // Example: allowedRoles = ['admin'], userRoles = ['worker'] -> FALSE
    // Example: allowedRoles = ['admin', 'boss'], userRoles = ['boss'] -> TRUE
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to perform this action.",
      });
    }

    next();
  };
};

module.exports = {authorize};