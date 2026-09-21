const router = require('express').Router();
const c = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Student: saved internships
router.get('/me/saved', protect, authorize('student', 'admin'), c.getSaved);
router.post('/me/saved/:internshipId', protect, authorize('student', 'admin'), c.toggleSaved);

// Admin: user management
router.get('/', protect, authorize('admin'), c.listUsers);
router.get('/:id', protect, authorize('admin'), c.getUser);
router.patch('/:id', protect, authorize('admin'), c.updateUser);
router.delete('/:id', protect, authorize('admin'), c.deleteUser);

module.exports = router;
