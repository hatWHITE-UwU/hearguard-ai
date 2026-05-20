'use strict';
/**
 * Genera environment.production.ts con la URL del backend
 * inyectada en tiempo de build por Vercel (variable API_URL).
 *
 * Uso local:
 *   API_URL=https://mi-backend.onrender.com node scripts/set-env.js
 */
const fs = require('node:fs');
const path = require('node:path');

const apiUrl  = process.env.API_URL  || '';
const isDemo  = process.env.PUBLIC_DEMO === 'true';

const content = `// GENERADO AUTOMÁTICAMENTE por scripts/set-env.js — no editar a mano.
export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  useDemoMocks: ${isDemo},
  publicDemo: ${isDemo},
};
`;

const dest = path.join(__dirname, '../src/environments/environment.production.ts');
fs.writeFileSync(dest, content, 'utf8');
console.log(`[set-env] environment.production.ts → apiUrl="${apiUrl}" publicDemo=${isDemo}`);
