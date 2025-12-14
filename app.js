const express = require("express");
const app = express();

// Google Cloud Run automatically sets this to 8080
const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  // בדיקה האם המשתנים קיימים
  const status = {
    supabaseUrl: process.env.SUPABASE_URL ? "✅ Found" : "❌ MISSING",
    supabaseKey:
      process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
        ? "✅ Found"
        : "❌ MISSING",
    jwtSecret:
      process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET
        ? "✅ Found"
        : "❌ MISSING",
    encryptionKey:
      process.env.ENCRYPTION_KEY || process.env.SYMMETRIC_ENCRYPTION_KEY
        ? "✅ Found"
        : "❌ MISSING",
  };

  res.json({
    message: "Server is ALIVE!",
    environmentCheck: status,
  });
});

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Debug Server is running on port ${PORT}`);
  console.log("Environment Variables Check:");
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "EXISTS" : "MISSING");
});
