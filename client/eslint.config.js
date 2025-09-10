/*jshint esversion: 6 */
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const reactConfig = react.configs.flat.recommended;

export default tseslint.config(
  { ignores: ['node_modules/**', 'dist/**'] },
  ...tseslint.configs.recommended,
  {
    ...reactConfig,
    plugins: { ...(reactConfig.plugins ?? {}), 'react-hooks': reactHooks },
    rules: {
      ...(reactConfig.rules ?? {}),
      ...reactHooks.configs.recommended.rules,
    },
    settings: { react: { version: '18.2' } },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-console': 'warn',
      'react/react-in-jsx-scope': 'off',
      'complexity': ['error', 8],
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: { react: { version: 'detect' } },
    rules: {},
  },
);
