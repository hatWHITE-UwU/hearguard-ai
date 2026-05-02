export const environment = {
  production: true,
  /**
   * Misma origen que la app (nginx/Docker reenvía `/api`). Si el front está en Netlify/Vercel
   * y el API en otro host, pon aquí la URL base del API, p. ej. `https://api.tudominio.com`.
   */
  apiUrl: '',
  /** En producción: true = siempre ver 10 demos + servidor; false = solo API. */
  useDemoMocks: true,
  /**
   * true = puedes abrir /app sin login (solo front estático + mocks). Pon false cuando el API y usuarios estén en producción.
   */
  publicDemo: true,
};
