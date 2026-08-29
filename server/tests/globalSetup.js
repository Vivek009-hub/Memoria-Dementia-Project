/**
 * globalSetup.js — Vitest global setup
 *
 * Starts ONE MongoMemoryServer before any test files run, shares its URI
 * via process.env.MONGO_TEST_URI, and stops it when all tests finish.
 *
 * Benefits:
 *  - The MongoDB binary is downloaded exactly once (cached on first run).
 *  - All test files share a single server, reducing startup overhead.
 *  - Eliminates parallel download contention between test files.
 *
 * Note: globalSetup runs in the main process and is not subject to hookTimeout.
 *       This allows the binary download to complete on the first run.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export async function setup() {
  // This will download the binary on the first run (~780MB, cached after that).
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_TEST_URI = mongoServer.getUri();
}

export async function teardown() {
  if (mongoServer) {
    await mongoServer.stop();
  }
}
