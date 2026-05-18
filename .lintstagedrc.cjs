'use strict';

module.exports = {
  // Run full backend lint when any backend JS file is staged.
  // Uses npm --prefix so npm resolves the local node_modules eslint binary.
  'backend/src/**/*.js': () => 'npm run lint --prefix backend',
  'backend/tests/**/*.js': () => 'npm run lint --prefix backend',

  // Angular: lint only the staged TS files via the frontend lint script.
  'frontend/src/**/*.ts': () => 'npm run lint --prefix frontend',

  // Python: syntax-check each staged file.
  'ai-service/**/*.py': (files) =>
    files.map((f) => `python -m py_compile "${f}"`),
};
