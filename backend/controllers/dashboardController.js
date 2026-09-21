const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/dashboard/student
exports.student = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const [statusAgg, recentApplications, appliedIds] = await Promise.all([
    Application.aggregate([
      { $match: { student: studentId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('internship', 'title company location mode stipendMin stipendMax status'),
    Application.find({ student: studentId }).select('internship').lean(),
  ]);

  const counts = {};
  for (const row of statusAgg) counts[row._id] = row.count;

  // Recommended: open roles matching the student's skills that they haven't applied to
  const skills = req.user.skills || [];
  const recommended = await Internship.find({
    status: 'open',
    _id: { $nin: appliedIds.map((a) => a.internship) },
    ...(skills.length ? { skills: { $in: skills } } : {}),
  })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('postedBy', 'name company');

  const profileFields = ['phone', 'college', 'degree', 'skills', 'bio', 'resumeUrl'];
  const filled = profileFields.filter((f) => {
    const v = req.user[f];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }).length;

  res.json({
    stats: {
      applied: statusAgg.reduce((s, r) => s + r.count, 0),
      underReview: counts['Under Review'] || 0,
      shortlisted: counts.Shortlisted || 0,
      interviews: counts.Interview || 0,
      selected: counts.Selected || 0,
    },
    profileCompletion: Math.round((filled / profileFields.length) * 100),
    recentApplications,
    recommended,
  });
});

// GET /api/dashboard/recruiter
exports.recruiter = asyncHandler(async (req, res) => {
  const [posted, active, myInternships] = await Promise.all([
    Internship.countDocuments({ postedBy: req.user._id }),
    Internship.countDocuments({ postedBy: req.user._id, status: 'open' }),
    Internship.find({ postedBy: req.user._id }).select('_id title company applicationsCount status createdAt').sort({ createdAt: -1 }),
  ]);

  const ids = myInternships.map((i) => i._id);
  const [funnelAgg, recentApplications] = await Promise.all([
    Application.aggregate([
      { $match: { internship: { $in: ids } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.find({ internship: { $in: ids } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('student', 'name email college avatar')
      .populate('internship', 'title company'),
  ]);

  const funnel = {};
  let totalApplicants = 0;
  for (const row of funnelAgg) {
    funnel[row._id] = row.count;
    totalApplicants += row.count;
  }

  res.json({
    stats: {
      posted,
      active,
      totalApplicants,
      shortlisted: (funnel.Shortlisted || 0) + (funnel.Interview || 0),
      selected: funnel.Selected || 0,
    },
    funnel,
    myInternships: myInternships.slice(0, 5),
    recentApplications,
  });
});

// GET /api/dashboard/admin
exports.admin = asyncHandler(async (req, res) => {
  const [
    totalUsers, students, recruiters, admins,
    totalInternships, openInternships, closedInternships, draftInternships,
    totalApplications, appAgg,
    recentUsers, recentInternships, topInternships,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'recruiter' }),
    User.countDocuments({ role: 'admin' }),
    Internship.countDocuments(),
    Internship.countDocuments({ status: 'open' }),
    Internship.countDocuments({ status: 'closed' }),
    Internship.countDocuments({ status: 'draft' }),
    Application.countDocuments(),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role isActive createdAt'),
    Internship.find().sort({ createdAt: -1 }).limit(5).select('title company status applicationsCount createdAt'),
    Internship.find().sort({ applicationsCount: -1 }).limit(5).select('title company applicationsCount views'),
  ]);

  const applicationsByStatus = {};
  for (const row of appAgg) applicationsByStatus[row._id] = row.count;

  res.json({
    users: { total: totalUsers, students, recruiters, admins },
    internships: { total: totalInternships, open: openInternships, closed: closedInternships, draft: draftInternships },
    applications: { total: totalApplications, byStatus: applicationsByStatus },
    recentUsers,
    recentInternships,
    topInternships,
  });
});
