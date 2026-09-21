const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function authResponse(res, statusCode, user) {
  return res.status(statusCode).json({ token: signToken(user), user: user.toSafeObject() });
}

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, college, company } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  // Public registration is only for students & recruiters (never admin)
  const safeRole = role === 'recruiter' ? 'recruiter' : 'student';

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: 'This email is already registered.' });

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: safeRole,
    phone,
    college,
    company,
  });

  authResponse(res, 201, user);
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: 'Your account has been deactivated. Contact support.' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  authResponse(res, 200, user);
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedInternships', 'title company location mode stipendMin stipendMax status');
  res.json({ user: user.toSafeObject() });
});

const PROFILE_FIELDS = [
  'name', 'phone', 'avatar',
  'college', 'degree', 'graduationYear', 'skills', 'bio', 'resumeUrl', 'linkedin', 'github', 'portfolio',
  'company', 'designation', 'companyWebsite',
];

// PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of PROFILE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (typeof updates.skills === 'string') {
    updates.skills = updates.skills.split(',').map((s) => s.trim()).filter(Boolean);
  }
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ user: user.toSafeObject() });
});

// PUT /api/auth/password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ message: 'Current password is incorrect.' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully.' });
});
