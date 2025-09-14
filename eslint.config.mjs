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
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression > TSAsExpression[typeAnnotation.type="TSUnknownKeyword"]',
          message:
            "Avoid double assertions. Use typed helpers or module augmentation instead of 'as unknown as'.",
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
  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      // Tests often use flexible shapes and mocks
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow double assertions in tests where handy for setup/mocks
      'no-restricted-syntax': 'off',
      // Relax import grouping/order in tests to allow mock-first patterns
      'import/order': 'off',
    },
  },
]
