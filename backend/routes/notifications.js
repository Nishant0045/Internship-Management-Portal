const router = require('express').Router();
const c = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, c.list);
router.patch('/read-all', protect, c.markAllRead);
router.patch('/:id/read', protect, c.markRead);

module.exports = router;
