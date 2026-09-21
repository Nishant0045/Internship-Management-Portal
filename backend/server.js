const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust proxy (needed on Render/Railway/Vercel for rate-limit + IPs)
app.set('trust proxy', 1);

// Security headers (allow cross-origin loading of uploaded files)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Logging + body parsing
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limit auth endpoints against brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/auth', authLimiter);

// Uploaded files (resumes, avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/internships', require('./routes/internships'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/uploads', require('./routes/uploads'));

// Health check (used by hosts + uptime monitors)
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    message: 'InternHub API is running',
    version: '2.0.0',
    uptime: Math.round(process.uptime()),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

// Serve the React frontend in production (single-service deploy).
// Works with: 1) root Dockerfile (copies build to backend/public)
//            2) local monorepo (frontend/dist after `npm run build` in frontend/)
const distCandidates = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '..', 'frontend', 'dist'),
];
const distDir = distCandidates.find((d) => fs.existsSync(path.join(d, 'index.html')));
if (distDir) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// API 404
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    const { demoMode } = await connectDB();
    if (demoMode) {
      // Fresh in-memory DB on every boot -> seed demo content automatically
      console.log('Seeding demo data...');
      await require('./seed').seedDatabase();
      console.log('Demo accounts -> admin@internhub.com / Admin@123 | recruiter@technova.io / Recruiter@123 | student@gmail.com / Student@123');
    }
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`InternHub API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`)
    );
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();
