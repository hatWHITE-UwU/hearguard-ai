import { test, expect } from '@playwright/test';

/**
 * E2E Smoke Test — HearGuard AI
 *
 * Covers the happy path: register → dashboard → navigate → login again.
 * Runs against http://localhost:4200 locally (webServer auto-starts Angular dev server)
 * or against BASE_URL env var in CI (Vercel preview).
 */

const TEST_USER = {
  name: 'E2E Smoke Test',
  email: `e2e_smoke_${Date.now()}@hearguard.test`,
  password: 'SmokePass1',
};

test.describe('HearGuard AI — Smoke', () => {
  // ── Auth guard redirect ──────────────────────────────────────────────────────

  test('redirige /app/dashboard a /login cuando no hay sesión', async ({ page }) => {
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  // ── Register → Dashboard ─────────────────────────────────────────────────────

  test('register y aterriza en dashboard', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Crear cuenta');

    await page.fill('#register-name', TEST_USER.name);
    await page.fill('#register-email', TEST_USER.email);
    await page.fill('#register-password', TEST_USER.password);
    await page.fill('#register-confirm', TEST_USER.password);

    await page.click('button[type="submit"]');

    // After successful registration, the app redirects to the dashboard
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 15_000 });
    await expect(page.locator('.app-header, .toolbar-title, .shell')).toBeVisible();
  });

  // ── Login flow ───────────────────────────────────────────────────────────────

  test('login con credenciales válidas redirige al dashboard', async ({ page }) => {
    // Use a fixed account that should exist (created by prior test run or seeded)
    // We register then immediately log out by clearing storage, then log back in.
    await page.goto('/register');

    const email = `e2e_login_${Date.now()}@hearguard.test`;
    await page.fill('#register-name', 'Login Tester');
    await page.fill('#register-email', email);
    await page.fill('#register-password', TEST_USER.password);
    await page.fill('#register-confirm', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 15_000 });

    // Clear localStorage to simulate a logged-out state
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');

    await page.fill('#login-email', email);
    await page.fill('#login-password', TEST_USER.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 15_000 });
  });

  test('login con credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', 'nadie@hearguard.test');
    await page.fill('#login-password', 'WrongPass1');
    await page.click('button[type="submit"]');

    // Error message appears without leaving /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('#login-api-error, .api-error')).toBeVisible({ timeout: 8_000 });
  });

  // ── Navigation ───────────────────────────────────────────────────────────────

  test('sidebar links navegan a las secciones principales', async ({ page }) => {
    // Register + land on dashboard
    await page.goto('/register');
    const email = `e2e_nav_${Date.now()}@hearguard.test`;
    await page.fill('#register-name', 'Nav Tester');
    await page.fill('#register-email', email);
    await page.fill('#register-password', TEST_USER.password);
    await page.fill('#register-confirm', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 15_000 });

    // Historial link (sidebar on desktop, bottom-nav on mobile)
    const historyLink = page.locator('a[href="/app/history"]').first();
    await historyLink.click();
    await expect(page).toHaveURL(/\/app\/history/);

    // Records link
    await page.locator('a[href="/app/records"]').first().click();
    await expect(page).toHaveURL(/\/app\/records/);

    // Profile link
    await page.locator('a[href="/app/profile"]').first().click();
    await expect(page).toHaveURL(/\/app\/profile/);
  });

  // ── Validation ───────────────────────────────────────────────────────────────

  test('register muestra errores con campos vacíos', async ({ page }) => {
    await page.goto('/register');
    // Submit empty form — HTML5 required doesn't fire until we touch the fields
    // Touch each required field and leave empty
    await page.click('#register-name');
    await page.click('#register-email');
    await page.click('button[type="submit"]');

    // At least one field-error should appear
    await expect(page.locator('.field-error').first()).toBeVisible({ timeout: 5_000 });
    await expect(page).toHaveURL(/\/register/);
  });
});
