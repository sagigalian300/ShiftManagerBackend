/*
const argon2 = require("argon2");

async function hash(plain) {
  if (typeof plain !== "string" || plain.length === 0) {
    throw new Error("encrypt: plain text must be a non-empty string");
  }
  const options = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  };
  return argon2.hash(plain, options);
}

async function verify(hash, plain) {
  if (!hash || typeof plain !== "string") {
    return false;
  }
  try {
    return await argon2.verify(hash, plain);
  } catch (err) {
    return false;
  }
}

module.exports = { hash, verify };
*/


const bcrypt = require("bcryptjs");

/**
 * Hash a plain text value using Bcryptjs.
 * @param {string} plain - text to hash (e.g. password)
 * @returns {Promise<string>} - bcrypt hash string
 */
async function hash(plain) {
  if (typeof plain !== "string" || plain.length === 0) {
    throw new Error("encrypt: plain text must be a non-empty string");
  }
  
  // 10 salt rounds is the standard default for bcrypt
  const saltRounds = 10;
  return bcrypt.hash(plain, saltRounds);
}

/**
 * Verify a plain text value against a bcrypt hash.
 * @param {string} hash - stored bcrypt hash
 * @param {string} plain - plain text to verify
 * @returns {Promise<boolean>}
 */
async function verify(hash, plain) {
  if (!hash || typeof plain !== "string") {
    return false;
  }
  try {
    // Note: bcrypt.compare takes (plain, hash) - opposite order of arguments inside the function
    return await bcrypt.compare(plain, hash);
  } catch (err) {
    return false;
  }
}

module.exports = { hash, verify };