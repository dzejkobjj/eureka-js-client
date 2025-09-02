// Vitest setup file to provide Mocha-compatible globals
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Make Mocha-style hooks available globally
global.before = beforeAll;
global.after = afterAll;
global.beforeEach = beforeEach;
global.afterEach = afterEach;

// Helper function to promisify callback-based functions
global.promisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
};