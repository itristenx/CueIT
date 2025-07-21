module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  verbose: true,
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};
