const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Use a fixed, deterministic JWT secret for the whole test run, so tokens
// generated in one test are valid when checked in another within the same suite.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret-do-not-use-in-production';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
// Leave EMAIL_USER/EMAIL_PASS unset in tests — utils/email.js already no-ops
// gracefully when they're missing, which is exactly the behavior we want here.

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Clear all collections between tests so each test starts from a clean slate
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});
