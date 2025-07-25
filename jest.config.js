export default {
  testMatch: [
    '<rootDir>/scripts/test/**/*.test.js',
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/nova-api/test/**/*.test.js'
  ],
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
