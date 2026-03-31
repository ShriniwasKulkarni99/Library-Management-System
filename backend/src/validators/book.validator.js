const { body } = require('express-validator');

const bookValidator = [
  body('title').trim().notEmpty().withMessage('Book title is required.'),
  body('author').trim().notEmpty().withMessage('Author is required.'),
  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer.'),
  body('available_quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Available quantity cannot be negative.'),
  body('price').optional().isDecimal({ force_decimal: false }).withMessage('Price must be a valid number.'),
  body('isbn').optional().trim(),
  body('semester').optional().trim(),
  body('department').optional().trim(),
  body('category').optional().trim(),
  body('location').optional().trim(),
  body('book_number').optional().trim(),
  body('description').optional().trim(),
];

const issueBookValidator = [
  body('user_id').isInt({ min: 1 }).withMessage('A valid user ID is required.'),
  body('book_id').isInt({ min: 1 }).withMessage('A valid book ID is required.'),
  body('due_date').isISO8601().withMessage('A valid due date is required (YYYY-MM-DD).'),
];

module.exports = { bookValidator, issueBookValidator };
