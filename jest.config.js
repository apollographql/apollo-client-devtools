module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  setupFilesAfterEnv: ['./test.setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/development',
    '<rootDir>/build',
    '<rootDir>/dist',
    '/node_modules/',
  ],
};