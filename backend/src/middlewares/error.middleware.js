/**
 * Centralised error handler - must be registered LAST in Express
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File size exceeds the allowed limit (5 MB).' });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'A record with that value already exists.' });
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ success: false, message: 'Cannot delete – record is referenced by other data.' });
  }

  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'Internal server error.';

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
