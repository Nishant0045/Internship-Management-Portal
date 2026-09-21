const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { getPagination, paginatedResponse } = require('../utils/pagination');

// GET /api/users?role=&q=&page=  (admin)
exports.listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 10);
  const filter = {};
  if (req.query.role && ['student', 'recruiter', 'admin'].includes(req.query.role)) {
    filter.role = req.query.role;
  }
  if (req.query.q) {
    const rx = new RegExp(req.query.q.trim(), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { company: rx }, { college: rx }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json(paginatedResponse(users.map((u) => u.toSafeObject()), total, page, limit));
});

// GET /api/users/:id  (admin)
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: user.toSafeObject() });
});

// PATCH /api/users/:id  (admin) — change role / activate / deactivate
exports.updateUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot modify your own account here.' });
  }
  const updates = {};
  if (req.body.role && ['student', 'recruiter', 'admin'].includes(req.body.role)) {
    updates.role = req.body.role;
  }
  if (typeof req.body.isActive === 'boolean') updates.isActive = req.body.isActive;
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: user.toSafeObject() });
});

// DELETE /api/users/:id  (admin)
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot delete your own account.' });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ message: 'User deleted.' });
});

// GET /api/users/me/saved  (student)
exports.getSaved = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedInternships',
    populate: { path: 'postedBy', select: 'name company' },
  });
  res.json({ data: user.savedInternships || [] });
});

// POST /api/users/me/saved/:internshipId  (student) — toggle save/unsave
exports.toggleSaved = asyncHandler(async (req, res) => {
  const { internshipId } = req.params;
  const user = await User.findById(req.user._id);
  const idx = user.savedInternships.findIndex((id) => id.toString() === internshipId);
  let saved;
  if (idx >= 0) {
    user.savedInternships.splice(idx, 1);
    saved = false;
  } else {
    user.savedInternships.push(internshipId);
    saved = true;
  }
  await user.save({ validateBeforeSave: false });
  res.json({ saved, savedIds: user.savedInternships });
});
