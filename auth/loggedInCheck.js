const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET; 

// This middleware checks for a valid token BEFORE the route handler runs.
async function loginCheck(req, res, next) {
    // 1. Get the JWT from the cookie (using the name you set in the login route)
    const token = req.cookies.auth_token; 

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Authentication token missing. Access denied." 
        });
    }

    try {
        // 2. Verify and decode the token
        const decoded = jwt.verify(token, JWT_SECRET); 
        
        // 3. Attach the userId to the request object for use in subsequent handlers
        req.userId = decoded.userId; 

        // 4. If valid, call `next()` to move to the next function in the chain (the route handler)
        next(); 

    } catch (err) {
        // Handle errors (expired, invalid signature)
        return res.status(401).json({ 
            success: false, 
            message: "Invalid or expired authentication token." 
        });
    }
}

module.exports = {
    loginCheck // Export the middleware
};