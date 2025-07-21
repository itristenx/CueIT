module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/app/request-catalog/[id]/request/__tests__/**/*.test.ts'],
  verbose: true,
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^\./page$': '<rootDir>/src/app/request-catalog/[id]/request/page.tsx',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
