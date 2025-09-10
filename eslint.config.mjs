// Flat config for ESLint v9+
import tseslint from 'typescript-eslint'
import pluginImport from 'eslint-plugin-import'

export default [
  ...tseslint.configs.recommended,
  {
    plugins: { import: pluginImport },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**'],
  },
]
