const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const FINAL_STATUSES = ['Selected', 'Rejected', 'Withdrawn'];

// POST /api/applications (student)
exports.apply = asyncHandler(async (req, res) => {
  const { internshipId, coverLetter, phone, resumeUrl, linkedin, portfolio } = req.body;

  const internship = await Internship.findById(internshipId);
  if (!internship) return res.status(404).json({ message: 'Internship not found.' });
  if (internship.status !== 'open') {
    return res.status(400).json({ message: 'This internship is no longer accepting applications.' });
  }
  if (internship.deadline && new Date(internship.deadline) < new Date()) {
    return res.status(400).json({ message: 'The application deadline for this internship has passed.' });
  }

  const existing = await Application.findOne({ student: req.user._id, internship: internshipId });
  if (existing) {
    return res.status(409).json({ message: 'You have already applied to this internship.' });
  }

  const application = await Application.create({
    student: req.user._id,
    internship: internshipId,
    coverLetter,
    phone: phone || req.user.phone,
    resumeUrl: resumeUrl || req.user.resumeUrl,
    linkedin: linkedin || req.user.linkedin,
    portfolio: portfolio || req.user.portfolio,
    timeline: [{ status: 'Applied', note: 'Application submitted', by: req.user._id }],
  });

  await Internship.findByIdAndUpdate(internshipId, { $inc: { applicationsCount: 1 } });

  // Notify the recruiter
  await Notification.create({
    user: internship.postedBy,
    type: 'new_application',
    title: 'New application received',
    message: `${req.user.name} applied for ${internship.title} at ${internship.company}.`,
    link: `/recruiter/applications?internshipId=${internship._id}`,
  });

  res.status(201).json(application);
});

// GET /api/applications/my (student)
exports.myApplications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 10);
  const filter = { student: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('internship', 'title company location mode stipendMin stipendMax status deadline category'),
    Application.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, total, page, limit));
});

// GET /api/applications/recruiter (recruiter: own listings, admin: all)
exports.recruiterList = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 10);
  const filter = {};

  if (req.user.role === 'recruiter') {
    const mine = await Internship.find({ postedBy: req.user._id }).select('_id');
    const mineIds = mine.map((i) => i._id.toString());
    if (req.query.internshipId) {
      if (!mineIds.includes(req.query.internshipId)) {
        return res.status(403).json({ message: 'You can only view applicants for your own listings.' });
      }
      filter.internship = req.query.internshipId;
    } else {
      filter.internship = { $in: mineIds };
    }
  } else if (req.query.internshipId) {
    filter.internship = req.query.internshipId;
  }

  if (req.query.status) filter.status = req.query.status;

  // Search applicants by name / email / college
  if (req.query.search) {
    const rx = new RegExp(req.query.search.trim(), 'i');
    const matched = await User.find({ $or: [{ name: rx }, { email: rx }, { college: rx }] }).select('_id');
    filter.student = { $in: matched.map((u) => u._id) };
  }

  const [items, total] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('student', 'name email phone college degree graduationYear skills resumeUrl linkedin github portfolio avatar')
      .populate('internship', 'title company location'),
    Application.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, total, page, limit));
});

// GET /api/applications/:id (applicant, listing owner, or admin)
exports.getById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('student', 'name email phone college degree graduationYear skills bio resumeUrl linkedin github portfolio avatar')
    .populate({ path: 'internship', populate: { path: 'postedBy', select: 'name company' } });
  if (!application) return res.status(404).json({ message: 'Application not found.' });

  const isOwner = application.student._id.toString() === req.user._id.toString();
  const isPoster = application.internship.postedBy._id.toString() === req.user._id.toString();
  if (!isOwner && !isPoster && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You do not have permission to view this application.' });
  }
  res.json(application);
});

// PATCH /api/applications/:id/withdraw (student, own application)
exports.withdraw = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  if (application.student.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You can only withdraw your own applications.' });
  }
  if (FINAL_STATUSES.includes(application.status)) {
    return res.status(400).json({ message: `Cannot withdraw an application that is ${application.status}.` });
  }
  application.status = 'Withdrawn';
  application.timeline.push({ status: 'Withdrawn', note: 'Withdrawn by applicant', by: req.user._id });
  await application.save();
  res.json(application);
});

// PATCH /api/applications/:id/status (recruiter owner / admin)
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const allowed = ['Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
  }

  const application = await Application.findById(req.params.id).populate('internship', 'title company postedBy');
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  assertCanManage(req, application);

  application.status = status;
  application.timeline.push({ status, note: note || `Moved to ${status}`, by: req.user._id });
  await application.save();

  await Notification.create({
    user: application.student,
    type: 'application_status',
    title: `Application ${status}`,
    message: `Your application for ${application.internship.title} at ${application.internship.company} is now: ${status}.`,
    link: `/applications/${application._id}`,
  });

  res.json(application);
});

// PATCH /api/applications/:id/interview (recruiter owner / admin)
exports.scheduleInterview = asyncHandler(async (req, res) => {
  const { date, link, location, notes } = req.body;
  if (!date) return res.status(400).json({ message: 'Interview date is required.' });

  const application = await Application.findById(req.params.id).populate('internship', 'title company postedBy');
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  assertCanManage(req, application);

  application.interview = { date, link, location, notes };
  application.status = 'Interview';
  application.timeline.push({
    status: 'Interview',
    note: `Interview scheduled for ${new Date(date).toLocaleString()}`,
    by: req.user._id,
  });
  await application.save();

  await Notification.create({
    user: application.student,
    type: 'interview',
    title: 'Interview scheduled',
    message: `Interview for ${application.internship.title} at ${application.internship.company} on ${new Date(date).toLocaleString()}.`,
    link: `/applications/${application._id}`,
  });

  res.json(application);
});

// PATCH /api/applications/:id/review (recruiter owner / admin) — internal rating + notes
exports.review = asyncHandler(async (req, res) => {
  const { rating, reviewNotes } = req.body;
  const application = await Application.findById(req.params.id).populate('internship', 'postedBy');
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  assertCanManage(req, application);

  if (rating !== undefined) application.rating = rating;
  if (reviewNotes !== undefined) application.reviewNotes = reviewNotes;
  await application.save();
  res.json(application);
});

function assertCanManage(req, application) {
  const posterId = application.internship.postedBy._id
    ? application.internship.postedBy._id.toString()
    : application.internship.postedBy.toString();
  if (posterId !== req.user._id.toString() && req.user.role !== 'admin') {
    const err = new Error('You can only manage applications for your own listings.');
    err.statusCode = 403;
    throw err;
  }
}
