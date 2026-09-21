const mongoose = require('mongoose');

const CATEGORIES = [
  'Software Engineering',
  'Web Development',
  'Mobile Development',
  'AI & Data Science',
  'Data Analyst',
  'UI/UX Design',
  'Cyber Security',
  'Digital Marketing',
  'Content Writing',
  'Human Resources',
  'Finance',
  'Operations',
];

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Internship title is required'], trim: true, maxlength: 120 },
    company: { type: String, required: [true, 'Company name is required'], trim: true, maxlength: 120 },
    companyWebsite: { type: String, trim: true },
    logo: { type: String },

    location: { type: String, required: [true, 'Location is required'], default: 'Remote', trim: true },
    mode: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], default: 'Remote' },
    jobType: { type: String, enum: ['Full-time', 'Part-time'], default: 'Full-time' },
    category: { type: String, required: [true, 'Category is required'], index: true },
    skills: { type: [String], default: [] },

    stipendMin: { type: Number, default: 0, min: 0 },
    stipendMax: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
    duration: { type: String, default: '3 months', trim: true },
    openings: { type: Number, default: 1, min: 1 },

    description: { type: String, required: [true, 'Description is required'], maxlength: 5000 },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    perks: { type: [String], default: [] },

    deadline: { type: Date },
    status: { type: String, enum: ['open', 'closed', 'draft'], default: 'open', index: true },
    isFeatured: { type: Boolean, default: false },

    views: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },

    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

internshipSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model('Internship', internshipSchema);
module.exports.CATEGORIES = CATEGORIES;
