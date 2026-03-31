const router  = require('express').Router();
const ctrl    = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { loginValidator, registerValidator, signupValidator } = require('../validators/auth.validator');

router.post('/login',    loginValidator,    validate, ctrl.login);
router.post('/signup',   signupValidator,   validate, ctrl.signup);
router.post('/register', authenticate, authorize('admin'), registerValidator, validate, ctrl.register);
router.get('/me',        authenticate, ctrl.getMe);

module.exports = router;
