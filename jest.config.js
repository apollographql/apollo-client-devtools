module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  setupFilesAfterEnv: ['./test.setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/build',
    '<rootDir>/dist',
    '/node_modules/',
  ],
};