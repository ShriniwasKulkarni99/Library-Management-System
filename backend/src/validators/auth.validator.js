const { body } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const registerValidator = [
  body('first_name').trim().notEmpty().withMessage('First name is required.'),
  body('last_name').trim().notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain a number.'),
  body('role')
    .isIn(['admin', 'student', 'staff'])
    .withMessage('Role must be admin, student, or staff.'),
  body('department').optional().trim(),
  body('enrollment_id').optional().trim(),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number.'),
];

const signupValidator = [
  body('first_name').trim().notEmpty().withMessage('First name is required.'),
  body('last_name').trim().notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain a number.'),
  body('role')
    .isIn(['student', 'staff'])
    .withMessage('Role must be student or staff.'),
  body('department').optional().trim(),
  body('enrollment_id').optional().trim(),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number.'),
];

module.exports = { loginValidator, registerValidator, signupValidator };
