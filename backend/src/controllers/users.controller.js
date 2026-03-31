const { pool: db } = require('../config/db');
const authService = require('../services/auth.service');
const { uploadProfileImage, deleteProfileImage } = require('../services/storage.service');

/**
 * GET /api/users  (admin)
 * Query: role, search, page, limit
 */
const listUsers = async (req, res, next) => {
  try {
    const { role, search = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where  = 'WHERE 1=1';
    const params = [];

    if (role) { where += ' AND role = ?'; params.push(role); }
    if (search) {
      where += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR enrollment_id LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM users ${where}`, params
    );

    const [users] = await db.query(
      `SELECT id, first_name, last_name, email, role, department, enrollment_id, phone, profile_image, is_active, created_at
       FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, data: users, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

/**
 * GET /api/users/:id  (admin or self)
 */
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await authService.findUserById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Non-admins can only view themselves
    if (req.user.role !== 'admin' && req.user.id !== +id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, user });
  } catch (err) { next(err); }
};

/**
 * PUT /api/users/:id  (admin or self)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.id !== +id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { first_name, last_name, department, enrollment_id, phone, address, is_active } = req.body;

    // Handle profile image upload
    let profileImagePath;
    if (req.file) {
      profileImagePath = await uploadProfileImage(req.file);
      // Delete old image
      const [rows] = await db.query('SELECT profile_image FROM users WHERE id = ?', [id]);
      if (rows[0]?.profile_image) {
        await deleteProfileImage(rows[0].profile_image);
      }
    }

    const updates  = [];
    const values   = [];

    if (first_name !== undefined)   { updates.push('first_name = ?');   values.push(first_name); }
    if (last_name !== undefined)    { updates.push('last_name = ?');    values.push(last_name); }
    if (department !== undefined)   { updates.push('department = ?');   values.push(department); }
    if (enrollment_id !== undefined){ updates.push('enrollment_id = ?');values.push(enrollment_id); }
    if (phone !== undefined)        { updates.push('phone = ?');        values.push(phone); }
    if (address !== undefined)      { updates.push('address = ?');      values.push(address); }
    if (profileImagePath)           { updates.push('profile_image = ?');values.push(profileImagePath); }
    if (req.user.role === 'admin' && is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    values.push(id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const updated = await authService.findUserById(id);
    res.json({ success: true, message: 'User updated successfully.', user: updated });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/users/:id  (admin only)
 */
const deleteUser = async (req, res, next) => {
  let conn;
  try {
    const { id } = req.params;
    if (+id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    const [users] = await conn.query(
      'SELECT id, role, profile_image FROM users WHERE id = ? LIMIT 1',
      [id]
    );

    if (!users[0]) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    const [[activeIssueStats]] = await conn.query(
      `SELECT COUNT(*) AS total
       FROM book_issues
       WHERE user_id = ? AND status IN ('issued', 'overdue') AND return_date IS NULL`,
      [id]
    );

    if (activeIssueStats.total > 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: 'Cannot delete this user while books are still issued. Return all active books first.',
      });
    }

    if (user.role === 'admin') {
      const [[adminIssueStats]] = await conn.query(
        'SELECT COUNT(*) AS total FROM book_issues WHERE issued_by = ?',
        [id]
      );

      if (adminIssueStats.total > 0) {
        await conn.rollback();
        return res.status(409).json({
          success: false,
          message: 'Cannot delete this admin because issue history references this account.',
        });
      }
    }

    await conn.query('DELETE FROM refresh_tokens WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM book_issues WHERE user_id = ?', [id]);

    const [result] = await conn.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await conn.commit();

    if (user.profile_image) {
      await deleteProfileImage(user.profile_image);
    }

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
};

/**
 * PUT /api/users/:id/password  (admin or self)
 */
const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    if (req.user.role !== 'admin' && req.user.id !== +id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found.' });

    if (req.user.role !== 'admin') {
      const valid = await authService.comparePassword(current_password, rows[0].password_hash);
      if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHash = await authService.hashPassword(new_password);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, id]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
};

module.exports = { listUsers, getUser, updateUser, deleteUser, changePassword };
