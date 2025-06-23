/*jshint esversion: 6 */
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';

export default [
  { ignores: ['node_modules/**', 'dist/**'] },
  ...tseslint.configs['flat/recommended'],
  react.configs.flat.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { project: './tsconfig.json' },
    },
    settings: { react: { version: 'detect' } },
    rules: { 'no-console': 'warn', 'react/react-in-jsx-scope': 'off' },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: { parser, ecmaVersion: 'latest', sourceType: 'module' },
    rules: {},
  },
];
