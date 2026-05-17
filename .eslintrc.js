/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['./packages/eslint-config/base.js'],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'build/',
    'coverage/',
    '*.config.js',
    '*.config.ts',
  ],
};
