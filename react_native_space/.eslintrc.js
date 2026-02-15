module.exports = {
  root: true,
  extends: ['expo', 'eslint:recommended'],
  ignorePatterns: ['/dist/*', '/node_modules/*'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
