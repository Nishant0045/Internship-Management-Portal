const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

/**
 * Connect to MongoDB.
 * - If MONGODB_URI is set -> connect to it (Atlas / local / docker).
 * - Otherwise -> boot an in-memory MongoDB (demo mode, data resets on restart).
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
    return { demoMode: false };
  }

  console.log('No MONGODB_URI set — starting in-memory demo database...');
  let MongoMemoryServer;
  try {
    ({ MongoMemoryServer } = require('mongodb-memory-server'));
  } catch {
    console.error(
      '\nERROR: No MONGODB_URI configured and mongodb-memory-server is not installed.\n' +
        'Fix: run `npm install` (dev dependencies) for demo mode, or set MONGODB_URI in .env\n'
    );
    process.exit(1);
  }

  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri());
  console.log('In-memory MongoDB started (demo mode — data resets on restart)');
  return { demoMode: true };
}

module.exports = connectDB;
