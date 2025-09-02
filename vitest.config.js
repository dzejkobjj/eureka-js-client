import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ['test/**/*.test.js'],
    exclude: ['test/fixtures/**', 'test/integration.test.js'],
    setupFiles: ['./test/setup.js'],
  },
});