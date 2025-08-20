import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test files
    include: ['test/**/*.test.js'],
    exclude: ['test/integration.test.js'], // Keep integration test separate
    
    // Environment
    environment: 'node',
    
    // Coverage configuration
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'test/**',
        'gulpfile.js',
        'vitest.config.js'
      ]
    },
    
    // Test timeout
    testTimeout: 10000,
    
    // Globals - enables describe/it without imports
    globals: false, // Keep explicit imports for better tree-shaking
  },
});