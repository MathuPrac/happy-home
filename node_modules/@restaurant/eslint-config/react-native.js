/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./base.js'],
  env: { 'react-native/react-native': true },
  plugins: ['react-native'],
  rules: {
    'react-native/no-unused-styles': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-hooks/exhaustive-deps': 'error',
  },
};
