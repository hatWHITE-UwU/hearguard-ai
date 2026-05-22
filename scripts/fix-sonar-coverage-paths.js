#!/usr/bin/env node
'use strict';

/**
 * SonarCloud espera rutas relativas a la raíz del repo (p. ej. frontend/src/app/...).
 * Jest/Vitest escriben SF:src/... desde el subdirectorio del paquete.
 */
const fs = require('fs');
const path = require('path');

function fixLcov(filePath, prefix) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[skip] ${filePath} no existe`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = content
    .split(/\r?\n/)
    .map((line) => {
      if (!line.startsWith('SF:')) {
        return line;
      }
      const rel = line.slice(3).replace(/\\/g, '/');
      if (rel.startsWith(prefix)) {
        return line;
      }
      return `SF:${prefix}${rel}`;
    })
    .join('\n');
  fs.writeFileSync(filePath, fixed);
  console.log(`[ok] ${filePath} → prefijo "${prefix}"`);
}

const root = path.join(__dirname, '..');
fixLcov(path.join(root, 'backend/coverage/lcov.info'), 'backend/');
fixLcov(
  path.join(root, 'frontend/coverage/hearguard-frontend/lcov.info'),
  'frontend/',
);
