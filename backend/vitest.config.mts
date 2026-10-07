import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['./tests/helpers/globalSetup.ts'],
    setupFiles: ['./tests/helpers/setupEnv.ts'],
    // Tests share one database; run files sequentially to avoid cross-file interference.
    fileParallelism: false,
  },
});
