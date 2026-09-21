const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

async function loadUser(req) {
  const token = getToken(req);
  if (!token) return null;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) return null;
  return user;
}

/** Require a valid JWT. Attaches full user doc as req.user */
async function protect(req, res, next) {
  try {
    const user = await loadUser(req);
    if (!user) return res.status(401).json({ message: 'Authentication required. Please log in.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
}

/** Attach user if a valid token is present, otherwise continue anonymously */
async function optionalAuth(req, res, next) {
  try {
    const user = await loadUser(req);
    if (user) req.user = user;
  } catch {
    // ignore invalid token for public routes
  }
  next();
}

/** Restrict route to specific roles. Must be used after `protect`. */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

module.exports = { protect, optionalAuth, authorize };
