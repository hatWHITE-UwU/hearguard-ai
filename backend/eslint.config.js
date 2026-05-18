'use strict';

const js = require('@eslint/js');
const pluginN = require('eslint-plugin-n');
const pluginSecurity = require('eslint-plugin-security');

const pluginNResolved = pluginN.default || pluginN;

module.exports = [
  js.configs.recommended,
  pluginNResolved.configs['flat/recommended-script'],
  pluginSecurity.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      // Node.js
      'n/no-missing-require': 'error',
      'n/no-unpublished-require': 'off',
      'n/no-process-exit': 'warn',

      // Security (OWASP-aligned)
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-possible-timing-attacks': 'warn',

      // Code quality
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-shadow': 'error',

      // Async safety
      'no-async-promise-executor': 'error',
      'no-return-await': 'error',

      // fetch / AbortSignal.timeout are stable in Node >=20 (LTS)
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },
  {
    // Relax rules for test files
    files: ['tests/**/*.js'],
    rules: {
      'no-console': 'off',
      'security/detect-object-injection': 'off',
      'n/no-unpublished-require': 'off',
    },
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
  },
];
