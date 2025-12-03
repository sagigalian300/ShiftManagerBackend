const argon2 = require("argon2");

/**
 * Hash a plain text value using Argon2id.
 * @param {string} plain - text to hash (e.g. password)
 * @returns {Promise<string>} - argon2 hash string
 */
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

/**
 * Verify a plain text value against an argon2 hash.
 * @param {string} hash - stored argon2 hash
 * @param {string} plain - plain text to verify
 * @returns {Promise<boolean>}
 */
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
