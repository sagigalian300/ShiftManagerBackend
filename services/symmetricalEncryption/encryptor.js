const crypto = require("crypto");

// Configuration
const ALGORITHM = "aes-256-cbc";
const RAW_KEY = process.env.ENCRYPTION_KEY || "default_fallback_secret"; // Ensure this is set in .env

// Ensure the key is exactly 32 bytes for AES-256
const KEY = crypto.createHash("sha256").update(String(RAW_KEY)).digest();

function encrypt(text) {
  if (!text) return text;

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

function decrypt(hash) {
  if (!hash) return hash;

  try {
    const parts = hash.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid hash format");
    }

    const iv = Buffer.from(parts.shift(), "hex");
    const encryptedText = parts.join(":");

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return null;
  }
}

module.exports = { encrypt, decrypt };
