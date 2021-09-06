module.exports = {
  extends: ['kentcdodds', 'kentcdodds/jest'],
  rules: {
    'no-console': 'off',
    'import/no-cycle': 'off',
    'import/no-extraneous-dependencies': 'off',
    'babel/new-cap': 'off',
    'require-await': 'warn',
    'import/no-unresolved': 'error',
  },
  overrides: [
    {
      files: ['**/__tests__/**'],
      settings: {
        'import/resolver': {
          jest: {
            jestConfigFile: require.resolve('./test/jest.config.js'),
          },
        },
      },
    },
  ],
}