import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Global setup starts ONE shared MongoMemoryServer before any test files run.
    // The binary is downloaded on first run (~780MB) and cached for subsequent runs.
    // globalSetup is not subject to hookTimeout — it runs until completion.
    globalSetup: './tests/globalSetup.js',

    // Per-hook timeout — reasonable once binary is cached
    hookTimeout: 30_000,

    // Per-test timeout
    testTimeout: 30_000,

    // Run test files sequentially — all files share a single MongoMemoryServer
    // instance, and parallel afterEach teardowns (in different workers) delete
    // sessions/users that other workers' in-flight tests still depend on.
    // fileParallelism: false serialises all files through a single runner.
    fileParallelism: false,
  },
});
