const db = require('../config/db');

/**
 * GET /api/dashboard/admin
 */
const adminDashboard = async (req, res, next) => {
  try {
    const [[users]]    = await db.query('SELECT COUNT(*) AS count FROM users');
    const [[students]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'student'");
    const [[staff]]    = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'staff'");
    const [[books]]    = await db.query('SELECT COUNT(*) AS count, SUM(available_quantity) AS available FROM books');
    const [[issued]]   = await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE status = 'issued'");
    const [[overdue]]  = await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE status = 'issued' AND due_date < CURDATE()");

    const [recentIssues] = await db.query(
      `SELECT bi.id, bi.issue_date, bi.due_date, bi.status,
              b.title AS book_title, u.first_name, u.last_name
       FROM book_issues bi
       JOIN books b ON bi.book_id = b.id
       JOIN users u ON bi.user_id = u.id
       ORDER BY bi.created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalUsers:     users.count,
        totalStudents:  students.count,
        totalStaff:     staff.count,
        totalBooks:     books.count,
        availableBooks: books.available,
        issuedBooks:    issued.count,
        overdueBooks:   overdue.count,
      },
      recentIssues,
    });
  } catch (err) { next(err); }
};

/**
 * GET /api/dashboard/student  (own data)
 */
const studentDashboard = async (req, res, next) => {
  try {
    const uid = req.user.id;
    const [[issued]]  = await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE user_id = ? AND status = 'issued'", [uid]);
    const [[returned]]= await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE user_id = ? AND status = 'returned'", [uid]);
    const [[overdue]] = await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE user_id = ? AND status = 'issued' AND due_date < CURDATE()", [uid]);
    const [[fines]]   = await db.query('SELECT COALESCE(SUM(fine_amount),0) AS total FROM book_issues WHERE user_id = ?', [uid]);

    const [activeIssues] = await db.query(
      `SELECT bi.id, bi.issue_date, bi.due_date, bi.status, b.title AS book_title, b.author AS book_author, b.book_number
       FROM book_issues bi JOIN books b ON bi.book_id = b.id
       WHERE bi.user_id = ? AND bi.status = 'issued'
       ORDER BY bi.due_date ASC LIMIT 5`,
      [uid]
    );

    res.json({ success: true, stats: { issued: issued.count, returned: returned.count, overdue: overdue.count, fines: fines.total }, activeIssues });
  } catch (err) { next(err); }
};

/**
 * GET /api/dashboard/staff  (own issued books summary)
 */
const staffDashboard = async (req, res, next) => {
  try {
    const uid = req.user.id;
    const [[issued]]  = await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE user_id = ? AND status = 'issued'", [uid]);
    const [[returned]]= await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE user_id = ? AND status = 'returned'", [uid]);

    const [activeIssues] = await db.query(
      `SELECT bi.id, bi.issue_date, bi.due_date, bi.status, b.title AS book_title, b.author AS book_author
       FROM book_issues bi JOIN books b ON bi.book_id = b.id
       WHERE bi.user_id = ? AND bi.status = 'issued'
       ORDER BY bi.due_date ASC LIMIT 5`,
      [uid]
    );

    res.json({ success: true, stats: { issued: issued.count, returned: returned.count }, activeIssues });
  } catch (err) { next(err); }
};

module.exports = { adminDashboard, studentDashboard, staffDashboard };
