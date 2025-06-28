/*jshint esversion: 6 */
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';

export default [
  { ignores: ['node_modules/**', 'dist/**'] },
  ...tseslint.configs['flat/recommended'],
  {
    plugins: { react },
    ...react.configs.flat.recommended,
    settings: { react: { version: '18.2' } },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { project: './tsconfig.json' },
    },
    rules: { 'no-console': 'warn', 'react/react-in-jsx-scope': 'off' },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: { parser, ecmaVersion: 'latest', sourceType: 'module' },
    settings: { react: { version: 'detect' } },
    rules: {},
  },
];
