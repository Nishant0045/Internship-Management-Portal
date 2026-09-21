const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['student', 'recruiter', 'admin'], default: 'student' },

    phone: { type: String, trim: true },
    avatar: { type: String },

    // ---- Student profile ----
    college: { type: String, trim: true },
    degree: { type: String, trim: true },
    graduationYear: { type: Number, min: 1950, max: 2100 },
    skills: { type: [String], default: [] },
    bio: { type: String, maxlength: 1000 },
    resumeUrl: { type: String },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },

    // ---- Recruiter profile ----
    company: { type: String, trim: true },
    designation: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },

    savedInternships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
