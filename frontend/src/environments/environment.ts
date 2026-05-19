export const environment = {
  production: false,
  /**
   * URL absoluta del API en local: evita depender del proxy de `ng serve` (a veces
   * devuelve 404 en `/api/*`). El backend ya permite CORS desde :4200 y :4201.
   * Si tu API usa otro puerto, cámbialo aquí (o en `proxy.conf.json` si vuelves a poner apiUrl: '').
   */
  apiUrl: 'http://127.0.0.1:3000', // NOSONAR — local dev only, never reaches production
  /** Muestra 10 registros demo mezclados con datos reales (pantalla Registros, dashboard, consejos). */
  useDemoMocks: true,
  /**
   * false: hay que iniciar sesión para /app/*. true solo para demos (no usar con datos reales).
   */
  /** true = mismo comportamiento que producción: entras a /app sin cuenta (usuario demo). */
  publicDemo: true,
};
