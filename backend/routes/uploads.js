const router = require('express').Router();
const c = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadResume, uploadAvatar } = require('../middleware/upload');

function runUpload(mw) {
  return (req, res, next) =>
    mw(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
}

router.post('/resume', protect, runUpload(uploadResume), c.resume);
router.post('/avatar', protect, runUpload(uploadAvatar), c.avatar);

module.exports = router;
