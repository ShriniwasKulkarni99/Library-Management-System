const router = require('express').Router();
const ctrl   = require('../controllers/issues.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { issueBookValidator } = require('../validators/book.validator');

router.get('/stats/summary', authenticate, authorize('admin'), ctrl.issueStats);
router.get('/',              authenticate, ctrl.listIssues);
router.get('/:id',           authenticate, ctrl.getIssue);
router.post('/',             authenticate, authorize('admin'), issueBookValidator, validate, ctrl.issueBook);
router.put('/:id/return',    authenticate, authorize('admin'), ctrl.returnBook);

module.exports = router;
