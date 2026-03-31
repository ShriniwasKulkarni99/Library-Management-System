const authService = require('../services/auth.service');

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const valid = await authService.comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const payload = {
      id:    user.id,
      email: user.email,
      role:  user.role,
      name:  `${user.first_name} ${user.last_name}`,
    };

    const token = authService.signToken(payload);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: authService.sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/register
 * Admin-only (or open during setup)
 */
const register = async (req, res, next) => {
  try {
    const newUser = await authService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: newUser,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/signup
 * Public self-signup for student/staff accounts
 */
const signup = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (!['student', 'staff'].includes(payload.role)) {
      return res.status(400).json({
        success: false,
        message: 'Only student or staff accounts can be created here.',
      });
    }

    const newUser = await authService.createUser(payload);
    res.status(201).json({
      success: true,
      message: 'Account created successfully. You can sign in now.',
      user: newUser,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.findUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, signup, getMe };
