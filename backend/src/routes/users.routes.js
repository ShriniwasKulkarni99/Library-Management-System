const router  = require('express').Router();
const ctrl    = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const upload  = require('../middlewares/upload.middleware');

router.get('/',              authenticate, authorize('admin'), ctrl.listUsers);
router.get('/:id',           authenticate, ctrl.getUser);
router.put('/:id',           authenticate, upload.single('profile_image'), ctrl.updateUser);
router.delete('/:id',        authenticate, authorize('admin'), ctrl.deleteUser);
router.put('/:id/password',  authenticate, ctrl.changePassword);

module.exports = router;
