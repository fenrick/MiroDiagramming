// ESLint v9 flat config
import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier/recommended'
import promise from 'eslint-plugin-promise'
import regexp from 'eslint-plugin-regexp'
import security from 'eslint-plugin-security'
import sonarjs from 'eslint-plugin-sonarjs'
import unicorn from 'eslint-plugin-unicorn'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

const typedTsConfigs = [
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...tseslint.configs.recommendedTypeChecked,
].map((config) => ({ ...config, files: ['**/*.{ts,tsx}'] }))

export default defineConfig(
  [
    globalIgnores([
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'src/stories/**',
      'tests/**/fixtures/**',
      '**/.pnpm/**',
      '**/out/**',
    ]),
  ],
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  promise.configs['flat/recommended'],
  regexp.configs['flat/recommended'],
  unicorn.configs.recommended,
  sonarjs.configs.recommended,
  prettier,
  security.configs.recommended,
  ...typedTsConfigs,
  {
    name: 'project-overrides',
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'sonarjs/cognitive-complexity': ['error', 8],
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/no-typeof-undefined': 'off',
      'import/no-unresolved': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: false,
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: false,
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    //    rules: {
    //      '@typescript-eslint/require-await': 'off',
    //      '@typescript-eslint/await-thenable': 'off',
    //      '@typescript-eslint/no-floating-promises': 'off',
    //      '@typescript-eslint/no-misused-promises': 'off',
    //      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    //      '@typescript-eslint/restrict-plus-operands': 'off',
    //      '@typescript-eslint/restrict-template-expressions': 'off',
    //      '@typescript-eslint/unbound-method': 'off',
    //      '@typescript-eslint/prefer-readonly': 'off',
    //      '@typescript-eslint/no-unsafe-assignment': 'off',
    //      '@typescript-eslint/no-unsafe-member-access': 'off',
    //      '@typescript-eslint/no-unsafe-call': 'off',
    //      '@typescript-eslint/no-unsafe-return': 'off',
    //      '@typescript-eslint/no-explicit-any': 'off',
    //      'unicorn/consistent-function-scoping': 'off',
    //      'promise/param-names': 'off',
    //      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    //      'security/detect-non-literal-fs-filename': 'off',
    //    },
  },
)
