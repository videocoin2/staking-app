module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'react-app',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier', 'react'],
  rules: {
    '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
      },
    ],
    'prettier/prettier': 'error',
    'react/prop-types': 0,
  },
  settings: {
    react: {
      version: 'latest',
    },
  },
};
