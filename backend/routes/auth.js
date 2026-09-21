const router = require('express').Router();
const { body } = require('express-validator');
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('role').optional().isIn(['student', 'recruiter']).withMessage('Role must be student or recruiter.'),
  ],
  validate,
  c.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  c.login
);

router.get('/me', protect, c.me);
router.put('/profile', protect, c.updateProfile);
router.put('/password', protect, c.changePassword);

module.exports = router;
