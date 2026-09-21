const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

function fileUrl(req, file, folder) {
  return `${req.protocol}://${req.get('host')}/uploads/${folder}/${file.filename}`;
}

// POST /api/uploads/resume  (field: resume)
exports.resume = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  const url = fileUrl(req, req.file, 'resumes');
  if (req.user.role === 'student') {
    await User.findByIdAndUpdate(req.user._id, { resumeUrl: url });
  }
  res.status(201).json({ url, message: 'Resume uploaded successfully.' });
});

// POST /api/uploads/avatar  (field: avatar)
exports.avatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  const url = fileUrl(req, req.file, 'avatars');
  await User.findByIdAndUpdate(req.user._id, { avatar: url });
  res.status(201).json({ url, message: 'Profile photo updated.' });
});
