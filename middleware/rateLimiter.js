const rateLimit = require("express-rate-limit");

// Define the limiter
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message:
      "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Optional: Only count failed requests.
  // If true, successful logins won't use up the user's quota.
  skipSuccessfulRequests: true,
});
module.exports = {
  rateLimiter,
};
