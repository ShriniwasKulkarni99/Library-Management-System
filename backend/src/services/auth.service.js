const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password
 */
const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

/**
 * Compare plain password with stored hash
 */
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

/**
 * Sign a JWT for the given user payload
 */
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

/**
 * Find user by ID (safe – no password)
 */
const findUserById = async (id) => {
  const [rows] = await db.query(
    'SELECT id, first_name, last_name, email, role, department, enrollment_id, phone, address, profile_image, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

/**
 * Create a new user
 */
const createUser = async (data) => {
  const {
    first_name, last_name, email, password,
    role, department, enrollment_id, phone, address,
  } = data;

  const password_hash = await hashPassword(password);

  const [result] = await db.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role, department, enrollment_id, phone, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, password_hash, role, department || null, enrollment_id || null, phone || null, address || null]
  );

  return findUserById(result.insertId);
};

/**
 * Build safe user object (strips password_hash)
 */
const sanitizeUser = (user) => {
  const { password_hash, ...safe } = user;
  return safe;
};

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  findUserByEmail,
  findUserById,
  createUser,
  sanitizeUser,
};
