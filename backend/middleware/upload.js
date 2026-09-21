const multer = require('multer');
const path = require('path');
const fs = require('fs');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function storageFor(subfolder) {
  const dest = path.join(__dirname, '..', 'uploads', subfolder);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '_').slice(0, 40);
      cb(null, `${req.user._id}-${Date.now()}-${base}${ext}`);
    },
  });
}

const resumeFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only PDF, DOC or DOCX files are allowed for resumes.'));
  }
  cb(null, true);
};

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed for avatars.'));
  }
  cb(null, true);
};

const resumeMB = Number(process.env.MAX_RESUME_MB || 5);

const uploadResume = multer({
  storage: storageFor('resumes'),
  fileFilter: resumeFilter,
  limits: { fileSize: resumeMB * 1024 * 1024 },
}).single('resume');

const uploadAvatar = multer({
  storage: storageFor('avatars'),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('avatar');

module.exports = { uploadResume, uploadAvatar };
