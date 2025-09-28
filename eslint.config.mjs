// eslint.config.js (ESLint v9 flat config)
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import sonarjs from 'eslint-plugin-sonarjs'
import importPlugin from 'eslint-plugin-import'
import promise from 'eslint-plugin-promise'
import regexp from 'eslint-plugin-regexp'
import unicorn from 'eslint-plugin-unicorn'
import security from 'eslint-plugin-security'

export default [
  // Base JS rules roughly equivalent to the “core” checks Sonar also relies on
  js.configs.recommended,

  // TypeScript: parser + recommended rules (mirrors many Clean Code correctness/readability checks)
  ...tseslint.configs.recommended,

  // Sonar’s own ESLint rules (subset of SonarQube’s JS/TS rules)
  sonarjs.configs.recommended,

  // High-value community rule packs that cover areas Sonar also cares about
  importPlugin.flatConfigs.recommended,
  promise.configs['flat/recommended'],
  regexp.configs['flat/recommended'],
  unicorn.configs['flat/recommended'],

  // Security hygiene rules (note: NOT equivalent to Sonar’s taint analysis)
  security.configs.recommended,

  // Project-specific tweaks
  {
    name: 'project-overrides',
    ignores: ['dist/**', 'coverage/**', '**/*.min.js'],
    rules: {
      // Sonar-like maintainability signal
      'sonarjs/cognitive-complexity': ['error', 15],

      // Keep noise down where packs overlap
      'unicorn/no-null': 'off', // often too strict
      'unicorn/prefer-module': 'off', // off if you still use CommonJS
      'import/no-unresolved': 'off', // leave to TS when using path aliases
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // Stronger TS settings for .ts/.tsx only
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: false, // set your tsconfig path & turn on type-aware rules if desired
      },
    },
    rules: {
      // Turn on a few type-aware-ish constraints even without full type-checker
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
]
