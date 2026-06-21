module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFilesAfterEnv: ['./tests/setup.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
  ],
  // Run test files serially — they share one in-memory MongoDB instance
  maxWorkers: 1,
};
