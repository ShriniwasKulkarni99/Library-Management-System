const db = require('../config/db');

/**
 * GET /api/issues
 * Query: status, user_id, page, limit
 */
const listIssues = async (req, res, next) => {
  try {
    const { status, user_id, search = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where  = 'WHERE 1=1';
    const params = [];

    // Non-admins can only see their own
    if (req.user.role !== 'admin') {
      where += ' AND bi.user_id = ?';
      params.push(req.user.id);
    } else if (user_id) {
      where += ' AND bi.user_id = ?';
      params.push(user_id);
    }

    if (status) { where += ' AND bi.status = ?'; params.push(status); }
    if (search) {
      where += ' AND (b.title LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM book_issues bi
       JOIN books b ON bi.book_id = b.id
       JOIN users u ON bi.user_id = u.id
       ${where}`, params
    );

    const [issues] = await db.query(
      `SELECT bi.*,
              b.title AS book_title, b.author AS book_author, b.book_number,
              u.first_name, u.last_name, u.email, u.enrollment_id, u.role AS user_role,
              a.first_name AS admin_first_name, a.last_name AS admin_last_name
       FROM book_issues bi
       JOIN books b ON bi.book_id = b.id
       JOIN users u ON bi.user_id = u.id
       JOIN users a ON bi.issued_by = a.id
       ${where}
       ORDER BY bi.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, data: issues, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

/**
 * GET /api/issues/:id
 */
const getIssue = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT bi.*,
              b.title AS book_title, b.author AS book_author, b.book_number,
              u.first_name, u.last_name, u.email, u.enrollment_id,
              a.first_name AS admin_first_name, a.last_name AS admin_last_name
       FROM book_issues bi
       JOIN books b ON bi.book_id = b.id
       JOIN users u ON bi.user_id = u.id
       JOIN users a ON bi.issued_by = a.id
       WHERE bi.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Issue record not found.' });

    // Non-admins can only view their own
    if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, issue: rows[0] });
  } catch (err) { next(err); }
};

/**
 * POST /api/issues  (admin only)
 */
const issueBook = async (req, res, next) => {
  try {
    const { user_id, book_id, due_date, notes } = req.body;

    // Check book availability
    const [[book]] = await db.query('SELECT * FROM books WHERE id = ? FOR UPDATE', [book_id]);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    if (book.available_quantity < 1) {
      return res.status(400).json({ success: false, message: 'Book is not available (no copies left).' });
    }

    // Check user exists
    const [[user]] = await db.query('SELECT id FROM users WHERE id = ? AND is_active = 1', [user_id]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found or inactive.' });

    // Check user doesn't already have this book issued
    const [[existing]] = await db.query(
      "SELECT id FROM book_issues WHERE user_id = ? AND book_id = ? AND status = 'issued'",
      [user_id, book_id]
    );
    if (existing) return res.status(400).json({ success: false, message: 'User already has this book issued.' });

    const today = new Date().toISOString().split('T')[0];

    const [result] = await db.query(
      `INSERT INTO book_issues (user_id, book_id, issued_by, issue_date, due_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, book_id, req.user.id, today, due_date, notes || null]
    );

    // Decrement available_quantity
    await db.query('UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ?', [book_id]);

    const [rows] = await db.query(
      `SELECT bi.*, b.title AS book_title, u.first_name, u.last_name
       FROM book_issues bi JOIN books b ON bi.book_id = b.id JOIN users u ON bi.user_id = u.id
       WHERE bi.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Book issued successfully.', issue: rows[0] });
  } catch (err) { next(err); }
};

/**
 * PUT /api/issues/:id/return  (admin only)
 */
const returnBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fine_amount = 0 } = req.body;

    const [[issue]] = await db.query('SELECT * FROM book_issues WHERE id = ?', [id]);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue record not found.' });
    if (issue.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Book already returned.' });
    }

    const today = new Date().toISOString().split('T')[0];

    await db.query(
      "UPDATE book_issues SET status = 'returned', return_date = ?, fine_amount = ? WHERE id = ?",
      [today, fine_amount, id]
    );

    // Increment available_quantity
    await db.query('UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ?', [issue.book_id]);

    res.json({ success: true, message: 'Book returned successfully.' });
  } catch (err) { next(err); }
};

/**
 * GET /api/issues/stats/summary  (admin)
 */
const issueStats = async (req, res, next) => {
  try {
    const [[active]]  = await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE status = 'issued'");
    const [[returned]]= await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE status = 'returned'");
    const [[overdue]] = await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE status = 'issued' AND due_date < CURDATE()");
    const [[fines]]   = await db.query("SELECT COALESCE(SUM(fine_amount),0) AS total FROM book_issues");

    res.json({ success: true, stats: { active: active.count, returned: returned.count, overdue: overdue.count, totalFines: fines.total } });
  } catch (err) { next(err); }
};

module.exports = { listIssues, getIssue, issueBook, returnBook, issueStats };
