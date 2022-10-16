module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  restoreMocks: true,
  testEnvironment: 'jsdom',
  testMatch: ['**/*.spec.+(ts|tsx)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
