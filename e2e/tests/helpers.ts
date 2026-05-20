import { test, expect, type Page } from '@playwright/test';

/**
 * Helpers compartidos por los specs de Playwright para evitar duplicación
 * de pasos comunes (navegación, login/register, comprobación de "dentro/fuera de la app").
 */

export const DEFAULT_PASSWORD = 'TestPass123!';

/**
 * Navega a una ruta del frontend y espera a que la red esté en reposo.
 * @param page  Página Playwright.
 * @param path  Ruta relativa al `BASE_URL` (ej. '/login').
 */
export async function gotoAndWait(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/**
 * Asegura que la app está renderizada y autenticada. Si redirige a /login
 * (modo no-demo y sin sesión), marca el test como `skipped`.
 */
export async function ensureInApp(page: Page): Promise<void> {
  await gotoAndWait(page, '/app/dashboard');
  if (page.url().includes('/login')) {
    test.skip(true, 'Skipped: requires authenticated session (demo mode not active)');
  }
}

/**
 * Rellena y envía el formulario de login.
 */
export async function fillLogin(page: Page, email: string, password: string): Promise<void> {
  await page.fill('[data-testid="login-email"], input[type="email"]', email);
  await page.fill('[data-testid="login-password"], input[type="password"]', password);
  await page.click('[data-testid="login-submit"], button[type="submit"]');
}

/**
 * Rellena y envía el formulario de registro.
 */
export async function fillRegister(
  page: Page,
  name: string,
  email: string,
  password: string,
): Promise<void> {
  const nameInput = page.locator('input[name="name"], [data-testid="register-name"]');
  if ((await nameInput.count()) > 0) {
    await nameInput.fill(name);
  }
  await page.fill('[data-testid="register-email"], input[type="email"]', email);
  await page.fill('[data-testid="register-password"], input[type="password"]', password);
  await page.click('[data-testid="register-submit"], button[type="submit"]');
}

/**
 * Genera un email único para evitar colisiones entre runs y entre tests del mismo run.
 */
export function uniqueEmail(prefix = 'e2e'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@hearguard.test`;
}

/**
 * Verifica que la URL termina en /app/dashboard tras un flujo de auth (timeout 15 s).
 */
export async function expectOnDashboard(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 15_000 });
}

/**
 * Registra un usuario nuevo a través del formulario y espera al dashboard.
 * Devuelve el email creado para reutilizarlo (ej. luego hacer logout y login).
 */
export async function registerNewUser(
  page: Page,
  prefix = 'e2e_reg',
  password: string = DEFAULT_PASSWORD,
): Promise<string> {
  const email = uniqueEmail(prefix);
  await gotoAndWait(page, '/register');
  await page.fill('#register-name', 'E2E Tester');
  await page.fill('#register-email', email);
  await page.fill('#register-password', password);
  await page.fill('#register-confirm', password);
  await page.click('button[type="submit"]');
  await expectOnDashboard(page);
  return email;
}
