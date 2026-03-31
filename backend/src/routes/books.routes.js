const router = require('express').Router();
const ctrl   = require('../controllers/books.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { bookValidator } = require('../validators/book.validator');

router.get('/stats/summary', authenticate, authorize('admin'), ctrl.bookStats);
router.get('/',              authenticate, ctrl.listBooks);
router.get('/next-number',   authenticate, authorize('admin'), ctrl.nextBookNumber);
router.get('/:id',           authenticate, ctrl.getBook);
router.post('/',             authenticate, authorize('admin'), bookValidator, validate, ctrl.createBook);
router.put('/:id',           authenticate, authorize('admin'), ctrl.updateBook);
router.delete('/:id',        authenticate, authorize('admin'), ctrl.deleteBook);

module.exports = router;
