import { test, expect } from '@playwright/test';
import {
  DEFAULT_PASSWORD,
  expectOnDashboard,
  gotoAndWait,
  registerNewUser,
} from './helpers';

/**
 * E2E Smoke Test — HearGuard AI
 *
 * Covers the happy path: register → dashboard → navigate → login again.
 * Runs against http://localhost:4200 locally (webServer auto-starts Angular dev server)
 * or against BASE_URL env var in CI (Vercel preview).
 */

test.describe('HearGuard AI — Smoke', () => {
  test('redirige /app/dashboard a /login cuando no hay sesión', async ({ page }) => {
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('register y aterriza en dashboard', async ({ page }) => {
    await gotoAndWait(page, '/register');
    await expect(page.locator('h1')).toContainText('Crear cuenta');
    await registerNewUser(page, 'e2e_smoke');
    await expect(page.locator('.app-header, .toolbar-title, .shell')).toBeVisible();
  });

  test('login con credenciales válidas redirige al dashboard', async ({ page }) => {
    const email = await registerNewUser(page, 'e2e_login');

    await page.evaluate(() => localStorage.clear());
    await gotoAndWait(page, '/login');

    await page.fill('#login-email', email);
    await page.fill('#login-password', DEFAULT_PASSWORD);
    await page.click('button[type="submit"]');

    await expectOnDashboard(page);
  });

  test('login con credenciales incorrectas muestra error', async ({ page }) => {
    await gotoAndWait(page, '/login');
    await page.fill('#login-email', 'nadie@hearguard.test');
    await page.fill('#login-password', 'WrongPass1');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('#login-api-error, .api-error')).toBeVisible({ timeout: 8_000 });
  });

  test('sidebar links navegan a las secciones principales', async ({ page }) => {
    await registerNewUser(page, 'e2e_nav');

    await page.locator('a[href="/app/history"]').first().click();
    await expect(page).toHaveURL(/\/app\/history/);

    await page.locator('a[href="/app/records"]').first().click();
    await expect(page).toHaveURL(/\/app\/records/);

    await page.locator('a[href="/app/profile"]').first().click();
    await expect(page).toHaveURL(/\/app\/profile/);
  });

  test('register muestra errores con campos vacíos', async ({ page }) => {
    await gotoAndWait(page, '/register');
    await page.click('#register-name');
    await page.click('#register-email');
    await page.click('button[type="submit"]');

    await expect(page.locator('.field-error').first()).toBeVisible({ timeout: 5_000 });
    await expect(page).toHaveURL(/\/register/);
  });
});
