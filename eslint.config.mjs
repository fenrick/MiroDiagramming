// Flat config for ESLint v9+
import tseslint from 'typescript-eslint'
import pluginImport from 'eslint-plugin-import'
import sonarjs from 'eslint-plugin-sonarjs'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import stylistic from '@stylistic/eslint-plugin'

const reactRecommended = {
  ...pluginReact.configs.flat.recommended,
  settings: {
    ...(pluginReact.configs.flat.recommended.settings ?? {}),
    react: { version: 'detect' },
  },
  rules: {
    ...pluginReact.configs.flat.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
  },
}

const reactHooksRecommended = {
  plugins: { 'react-hooks': pluginReactHooks },
  rules: {
    ...pluginReactHooks.configs.recommended.rules,
  },
}

const jsxA11yRecommended = {
  files: ['**/*.{tsx,jsx}'],
  plugins: { 'jsx-a11y': jsxA11y },
  rules: {
    ...jsxA11y.configs.recommended.rules,
  },
}

export default [
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  reactRecommended,
  reactHooksRecommended,
  jsxA11yRecommended,
  {
    plugins: { import: pluginImport, '@stylistic': stylistic },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      // Sonar alignment rules can be enabled in a dedicated stricter config.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/no-extra-semi': 'error',
      '@stylistic/semi': ['error', 'never'],
      // Keep additional structural rules in a separate pass to avoid churn.
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'import/no-duplicates': 'error',
      // Sonar duplication/complexity checks handled by SonarCloud; leave off here.
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
        ecmaFeatures: {
          jsx: true,
        },
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
