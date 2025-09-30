// eslint.config.js (ESLint v9 flat config)
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import sonarjs from 'eslint-plugin-sonarjs'
import importPlugin from 'eslint-plugin-import'
import promise from 'eslint-plugin-promise'
import regexp from 'eslint-plugin-regexp'
import unicorn from 'eslint-plugin-unicorn'
import security from 'eslint-plugin-security'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig(
  // Global ignores first so they short‑circuit for all subsequent configs
  [
    globalIgnores([
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'src/stories/**',
      'tests/**/fixtures/**',
      '**/*.min.js',
    ]),
  ],

  // Base JS rules roughly equivalent to the “core” checks Sonar also relies on
  js.configs.recommended,

  // TypeScript: parser + recommended rules (mirrors many Clean Code correctness/readability checks)
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
        // Let files outside the TS project (like stories we ignore) fall back
        // to a default program if they slip through via CLI globs.
        allowDefaultProject: ['src/stories/**/*'],
      },
    },
  },

  // Sonar’s own ESLint rules (subset of SonarQube’s JS/TS rules)
  sonarjs.configs.recommended,

  // High-value community rule packs that cover areas Sonar also cares about
  importPlugin.flatConfigs.recommended,
  promise.configs['flat/recommended'],
  regexp.configs['flat/recommended'],
  unicorn.configs['recommended'],

  // Security hygiene rules (note: NOT equivalent to Sonar’s taint analysis)
  security.configs.recommended,

  // Project-specific tweaks
  {
    name: 'project-overrides',
    // Keep global ignores aligned with tsconfig.eslint.json `exclude`
    // so type-aware linting scans the same set of files.
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'src/stories/**',
      'tests/**/fixtures/**',
      '**/*.min.js',
    ],
    rules: {
      // Sonar-like maintainability signal
      'sonarjs/cognitive-complexity': ['error', 8],

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
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: ['src/stories/**/*'],
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
)
