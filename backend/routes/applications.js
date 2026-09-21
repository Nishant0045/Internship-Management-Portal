const router = require('express').Router();
const { body } = require('express-validator');
const c = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Student
router.post(
  '/',
  protect,
  authorize('student'),
  [
    body('internshipId').notEmpty().withMessage('Internship ID is required.'),
    body('coverLetter').trim().notEmpty().withMessage('Cover letter is required.'),
  ],
  validate,
  c.apply
);
router.get('/my', protect, authorize('student'), c.myApplications);
router.patch('/:id/withdraw', protect, authorize('student'), c.withdraw);

// Recruiter / admin
router.get('/recruiter', protect, authorize('recruiter', 'admin'), c.recruiterList);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), c.updateStatus);
router.patch('/:id/interview', protect, authorize('recruiter', 'admin'), c.scheduleInterview);
router.patch('/:id/review', protect, authorize('recruiter', 'admin'), c.review);

// Shared (owner / poster / admin checked in controller)
router.get('/:id', protect, c.getById);

module.exports = router;
