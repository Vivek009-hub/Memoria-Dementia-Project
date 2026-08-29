import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

/**
 * Connect to the shared MongoMemoryServer started by tests/globalSetup.js.
 * The URI is passed via process.env.MONGO_TEST_URI.
 */
beforeAll(async () => {
  const uri = process.env.MONGO_TEST_URI;
  if (!uri) {
    throw new Error('MONGO_TEST_URI is not set — ensure globalSetup ran correctly');
  }
  // Only connect if not already connected (supports multiple test files reusing state)
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  // Only disconnect if we're the last consumer — globalSetup handles server teardown
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
