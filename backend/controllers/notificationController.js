const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { getPagination, paginatedResponse } = require('../utils/pagination');

// GET /api/notifications
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 15);
  const [items, total, unreadCount] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);
  res.json({ ...paginatedResponse(items, total, page, limit), unreadCount });
});

// PATCH /api/notifications/:id/read
exports.markRead = asyncHandler(async (req, res) => {
  const note = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!note) return res.status(404).json({ message: 'Notification not found.' });
  res.json(note);
});

// PATCH /api/notifications/read-all
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked as read.' });
});
