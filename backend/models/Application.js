const mongoose = require('mongoose');

const STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn'];

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true, index: true },

    coverLetter: { type: String, required: [true, 'Cover letter is required'], maxlength: 2000 },
    phone: { type: String, trim: true },
    resumeUrl: { type: String },
    linkedin: { type: String, trim: true },
    portfolio: { type: String, trim: true },

    status: { type: String, enum: STATUSES, default: 'Applied', index: true },
    timeline: { type: [timelineSchema], default: [] },

    interview: {
      date: { type: Date },
      link: { type: String, trim: true },
      location: { type: String, trim: true },
      notes: { type: String },
    },

    // Internal recruiter evaluation
    rating: { type: Number, min: 0, max: 5 },
    reviewNotes: { type: String, maxlength: 2000 },
  },
  { timestamps: true }
);

// A student can apply to the same internship only once
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
module.exports.STATUSES = STATUSES;
