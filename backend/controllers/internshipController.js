const Internship = require('../models/Internship');
const Application = require('../models/Application');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { getPagination, paginatedResponse } = require('../utils/pagination');

function buildSort(sort) {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'stipend_high':
      return { stipendMax: -1, createdAt: -1 };
    case 'stipend_low':
      return { stipendMax: 1, createdAt: -1 };
    case 'deadline':
      return { deadline: 1, createdAt: -1 };
    case 'popular':
      return { applicationsCount: -1, views: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

// GET /api/internships
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 9);
  const { q, category, mode, jobType, location, minStipend, skills, sort, mine, status } = req.query;

  const filter = {};

  // Visibility: public sees open roles; recruiters can list their own; admin can see all
  if (mine === 'true' && req.user) {
    filter.postedBy = req.user._id;
    if (status && ['open', 'closed', 'draft'].includes(status)) filter.status = status;
  } else if (req.user && req.user.role === 'admin' && status === 'all') {
    // no status filter
  } else if (status && ['open', 'closed', 'draft'].includes(status) && req.user && req.user.role !== 'student') {
    filter.status = status;
  } else {
    filter.status = 'open';
  }

  if (q) {
    const rx = new RegExp(q.trim(), 'i');
    filter.$or = [{ title: rx }, { company: rx }, { description: rx }, { skills: rx }, { location: rx }];
  }
  if (category) filter.category = category;
  if (mode) filter.mode = mode;
  if (jobType) filter.jobType = jobType;
  if (location) filter.location = new RegExp(location.trim(), 'i');
  if (minStipend) filter.stipendMax = { $gte: Number(minStipend) };
  if (skills) {
    const arr = Array.isArray(skills) ? skills : String(skills).split(',').map((s) => s.trim()).filter(Boolean);
    if (arr.length) filter.skills = { $in: arr.map((s) => new RegExp(`^${s}$`, 'i')) };
  }

  const [items, total] = await Promise.all([
    Internship.find(filter).sort(buildSort(sort)).skip(skip).limit(limit)
      .populate('postedBy', 'name company'),
    Internship.countDocuments(filter),
  ]);

  res.json(paginatedResponse(items, total, page, limit));
});

// GET /api/internships/meta — distinct filter values for the browse page
exports.meta = asyncHandler(async (req, res) => {
  const [categories, locations, skillAgg] = await Promise.all([
    Internship.distinct('category', { status: 'open' }),
    Internship.distinct('location', { status: 'open' }),
    Internship.aggregate([
      { $match: { status: 'open' } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 24 },
    ]),
  ]);
  res.json({
    categories: categories.filter(Boolean).sort(),
    locations: locations.filter(Boolean).sort(),
    modes: ['Remote', 'On-site', 'Hybrid'],
    skills: skillAgg.map((s) => s._id).filter(Boolean),
  });
});

// GET /api/internships/featured
exports.featured = asyncHandler(async (req, res) => {
  const items = await Internship.find({ status: 'open' })
    .sort({ isFeatured: -1, applicationsCount: -1, createdAt: -1 })
    .limit(6)
    .populate('postedBy', 'name company');
  res.json({ data: items });
});

// GET /api/internships/:id
exports.getById = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id).populate('postedBy', 'name company companyWebsite');
  if (!internship) return res.status(404).json({ message: 'Internship not found.' });

  // Fire-and-forget view counter
  Internship.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

  const result = internship.toObject();

  // Personalize for logged-in students
  if (req.user && req.user.role === 'student') {
    const [application, me] = await Promise.all([
      Application.findOne({ student: req.user._id, internship: internship._id }).select('_id status createdAt'),
      User.findById(req.user._id).select('savedInternships'),
    ]);
    result.hasApplied = !!application;
    result.myApplication = application;
    result.isSaved = (me.savedInternships || []).some((id) => id.toString() === internship._id.toString());
  }

  res.json(result);
});

// POST /api/internships (recruiter, admin)
exports.create = asyncHandler(async (req, res) => {
  if (req.body.deadline && new Date(req.body.deadline) < new Date()) {
    return res.status(400).json({ message: 'Deadline must be a future date.' });
  }
  const internship = await Internship.create({ ...reqBody(req), postedBy: req.user._id });
  res.status(201).json(internship);
});

// PUT /api/internships/:id (owner or admin)
exports.update = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) return res.status(404).json({ message: 'Internship not found.' });
  assertOwnerOrAdmin(req, internship);

  if (req.body.deadline && new Date(req.body.deadline) < new Date()) {
    return res.status(400).json({ message: 'Deadline must be a future date.' });
  }
  Object.assign(internship, reqBody(req));
  await internship.save();
  res.json(internship);
});

// PATCH /api/internships/:id/status (owner or admin)
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['open', 'closed', 'draft'].includes(status)) {
    return res.status(400).json({ message: 'Status must be open, closed or draft.' });
  }
  const internship = await Internship.findById(req.params.id);
  if (!internship) return res.status(404).json({ message: 'Internship not found.' });
  assertOwnerOrAdmin(req, internship);
  internship.status = status;
  await internship.save();
  res.json(internship);
});

// DELETE /api/internships/:id (owner or admin)
exports.remove = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) return res.status(404).json({ message: 'Internship not found.' });
  assertOwnerOrAdmin(req, internship);

  await Promise.all([
    Application.deleteMany({ internship: internship._id }),
    User.updateMany({}, { $pull: { savedInternships: internship._id } }),
    internship.deleteOne(),
  ]);
  res.json({ message: 'Internship and its applications were deleted.' });
});

function reqBody(req) {
  const allowed = [
    'title', 'company', 'companyWebsite', 'logo', 'location', 'mode', 'jobType',
    'category', 'skills', 'stipendMin', 'stipendMax', 'currency', 'duration',
    'openings', 'description', 'responsibilities', 'requirements', 'perks',
    'deadline', 'status', 'isFeatured',
  ];
  const body = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) body[key] = req.body[key];
  }
  // Only admins can feature listings
  if (body.isFeatured && req.user.role !== 'admin') delete body.isFeatured;
  return body;
}

function assertOwnerOrAdmin(req, internship) {
  const isOwner = internship.postedBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    const err = new Error('You can only manage your own listings.');
    err.statusCode = 403;
    throw err;
  }
}
