const db = require('../config/db');

const DEPARTMENT_CODES = {
  'Computer Science': 'CS',
  'Information Technology': 'IT',
  'Electronics': 'EC',
  'Mechanical': 'ME',
  'Civil': 'CE',
  'General': 'GN',
  'Library': 'LB',
};

const getDepartmentCode = (department) => DEPARTMENT_CODES[department] || 'GEN';

const ensureBookNumberSequencesTable = async (conn = db) => {
  await conn.query(
    `CREATE TABLE IF NOT EXISTS book_number_sequences (
      department_code VARCHAR(10) PRIMARY KEY,
      last_number INT UNSIGNED NOT NULL DEFAULT 0,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`
  );
};

const getLatestBookSeries = async (department, conn = db) => {
  const deptCode = getDepartmentCode(department);
  const prefix = `BK-${deptCode}-`;

  const [rows] = await conn.query(
    `SELECT book_number
     FROM books
     WHERE book_number LIKE ?
     ORDER BY id DESC`,
    [`${prefix}%`]
  );

  let maxSeries = 0;
  for (const row of rows) {
    const match = row.book_number?.match(new RegExp(`^${prefix}(\\d+)$`));
    if (!match) continue;
    const current = Number(match[1]);
    if (current > maxSeries) maxSeries = current;
  }

  return { deptCode, prefix, maxSeries };
};

const peekNextBookNumber = async (department, conn = db) => {
  await ensureBookNumberSequencesTable(conn);

  const { deptCode, prefix, maxSeries } = await getLatestBookSeries(department, conn);
  const [[sequence]] = await conn.query(
    'SELECT last_number FROM book_number_sequences WHERE department_code = ?',
    [deptCode]
  );

  const nextSeries = Math.max(sequence?.last_number || 0, maxSeries) + 1;
  return `${prefix}${String(nextSeries).padStart(3, '0')}`;
};

const reserveNextBookNumber = async (department, conn) => {
  await ensureBookNumberSequencesTable(conn);

  const { deptCode, prefix, maxSeries } = await getLatestBookSeries(department, conn);
  const [[sequence]] = await conn.query(
    'SELECT last_number FROM book_number_sequences WHERE department_code = ? FOR UPDATE',
    [deptCode]
  );

  const nextSeries = Math.max(sequence?.last_number || 0, maxSeries) + 1;

  if (sequence) {
    await conn.query(
      'UPDATE book_number_sequences SET last_number = ? WHERE department_code = ?',
      [nextSeries, deptCode]
    );
  } else {
    await conn.query(
      'INSERT INTO book_number_sequences (department_code, last_number) VALUES (?, ?)',
      [deptCode, nextSeries]
    );
  }

  return `${prefix}${String(nextSeries).padStart(3, '0')}`;
};

/**
 * GET /api/books
 * Query: search, department, category, semester, page, limit
 */
const listBooks = async (req, res, next) => {
  try {
    const { search = '', department, category, semester, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where  = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ? OR book_number LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (department) { where += ' AND department = ?'; params.push(department); }
    if (category)   { where += ' AND category = ?';   params.push(category); }
    if (semester)   { where += ' AND semester = ?';   params.push(semester); }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM books ${where}`, params);

    const [books] = await db.query(
      `SELECT * FROM books ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, data: books, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

/**
 * GET /api/books/:id
 */
const getBook = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.json({ success: true, book: rows[0] });
  } catch (err) { next(err); }
};

/**
 * GET /api/books/next-number
 */
const nextBookNumber = async (req, res, next) => {
  try {
    const bookNumber = await peekNextBookNumber(req.query.department);
    res.json({ success: true, book_number: bookNumber });
  } catch (err) { next(err); }
};

/**
 * POST /api/books  (admin)
 */
const createBook = async (req, res, next) => {
  let conn;
  try {
    const {
      title, author, isbn, semester, department, category,
      quantity, available_quantity, price, location, book_number, description,
    } = req.body;

    const avail = available_quantity !== undefined ? available_quantity : quantity;
    conn = await db.getConnection();
    await conn.beginTransaction();

    const resolvedBookNumber = book_number || await reserveNextBookNumber(department, conn);

    const [result] = await conn.query(
      `INSERT INTO books (title, author, isbn, semester, department, category, quantity, available_quantity, price, location, book_number, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, isbn || null, semester || null, department || null, category || null,
       quantity, avail, price || null, location || null, resolvedBookNumber, description || null]
    );

    await conn.commit();

    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Book created successfully.', book: rows[0] });
  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
};

/**
 * PUT /api/books/:id  (admin)
 */
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = ['title','author','isbn','semester','department','category','quantity','available_quantity','price','location','book_number','description'];
    const updates = [];
    const values  = [];

    fields.forEach(f => {
      if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); }
    });

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update.' });

    values.push(id);
    const [result] = await db.query(`UPDATE books SET ${updates.join(', ')} WHERE id = ?`, values);

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Book not found.' });

    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
    res.json({ success: true, message: 'Book updated.', book: rows[0] });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/books/:id  (admin)
 */
const deleteBook = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.json({ success: true, message: 'Book deleted.' });
  } catch (err) { next(err); }
};

/**
 * GET /api/books/stats/summary  (admin)
 */
const bookStats = async (req, res, next) => {
  try {
    const [[totalBooks]]    = await db.query('SELECT COUNT(*) AS count, SUM(quantity) AS total_copies FROM books');
    const [[issued]]        = await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE status = 'issued'");
    const [[overdue]]       = await db.query("SELECT COUNT(*) AS count FROM book_issues WHERE status = 'overdue' OR (status = 'issued' AND due_date < CURDATE())");
    const [departments]     = await db.query('SELECT department, COUNT(*) AS count FROM books WHERE department IS NOT NULL GROUP BY department');

    res.json({ success: true, stats: { totalBooks: totalBooks.count, totalCopies: totalBooks.total_copies, issued: issued.count, overdue: overdue.count, departments } });
  } catch (err) { next(err); }
};

module.exports = { listBooks, getBook, nextBookNumber, createBook, updateBook, deleteBook, bookStats };
