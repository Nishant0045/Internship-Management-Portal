const router = require('express').Router();
const c = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/student', protect, authorize('student'), c.student);
router.get('/recruiter', protect, authorize('recruiter'), c.recruiter);
router.get('/admin', protect, authorize('admin'), c.admin);

module.exports = router;
