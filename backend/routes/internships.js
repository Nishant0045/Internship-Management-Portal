const router = require('express').Router();
const { body } = require('express-validator');
const c = require('../controllers/internshipController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const internshipValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('company').trim().notEmpty().withMessage('Company is required.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('mode').optional().isIn(['Remote', 'On-site', 'Hybrid']).withMessage('Invalid mode.'),
  body('jobType').optional().isIn(['Full-time', 'Part-time']).withMessage('Invalid job type.'),
  body('status').optional().isIn(['open', 'closed', 'draft']).withMessage('Invalid status.'),
];

// Public (+ optional personalization when logged in)
router.get('/', optionalAuth, c.list);
router.get('/meta', c.meta);
router.get('/featured', c.featured);
router.get('/:id', optionalAuth, c.getById);

// Recruiter / admin
router.post('/', protect, authorize('recruiter', 'admin'), internshipValidation, validate, c.create);
router.put('/:id', protect, authorize('recruiter', 'admin'), internshipValidation, validate, c.update);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), c.updateStatus);
router.delete('/:id', protect, authorize('recruiter', 'admin'), c.remove);

module.exports = router;
