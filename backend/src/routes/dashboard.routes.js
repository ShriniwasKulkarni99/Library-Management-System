const router = require('express').Router();
const ctrl   = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/admin',   authenticate, authorize('admin'),           ctrl.adminDashboard);
router.get('/student', authenticate, authorize('student'),         ctrl.studentDashboard);
router.get('/staff',   authenticate, authorize('staff'),           ctrl.staffDashboard);

module.exports = router;
