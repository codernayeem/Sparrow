export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'lib/**/*.js',
    'middleware/**/*.js'
  ]
};