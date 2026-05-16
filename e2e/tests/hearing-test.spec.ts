import { test, expect, Page } from '@playwright/test';

// ── Demo-mode helpers ─────────────────────────────────────────────────────────
// HearGuard runs in PUBLIC_DEMO=true on Vercel, auto-logging in with a demo user.
// These tests work both in demo mode and with real credentials.

async function ensureInApp(page: Page) {
  await page.goto('/app/dashboard');
  await page.waitForLoadState('networkidle');

  // If redirected to login (non-demo mode), mark test as skipped context
  if (page.url().includes('/login')) {
    test.skip(true, 'Skipped: requires authenticated session (demo mode not active)');
  }
}

// ── Dashboard ────────────────────────────────────────────────────────────────

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await ensureInApp(page);
  });

  test('renders main navigation', async ({ page }) => {
    const nav = page.locator('nav, [class*="nav"], [class*="shell"]');
    await expect(nav.first()).toBeVisible();
  });

  test('shows dashboard content (no JS crash)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/app/dashboard');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });
});

// ── Hearing test flow ────────────────────────────────────────────────────────

test.describe('Hearing test — Habits questionnaire', () => {
  test.beforeEach(async ({ page }) => {
    await ensureInApp(page);
    await page.goto('/app/hearing/habits');
    await page.waitForLoadState('networkidle');
  });

  test('habits form renders selectors or inputs', async ({ page }) => {
    // Form should have some interactive elements
    const inputs = page.locator('select, input[type="range"], input[type="radio"]');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('habits page has submit / next button', async ({ page }) => {
    const submitBtn = page.locator(
      'button[type="submit"], button:has-text("Continuar"), button:has-text("Siguiente")',
    );
    await expect(submitBtn.first()).toBeVisible();
  });
});

test.describe('Hearing test — Tone test page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly; if habits aren't filled, the page shows the "go to habits" card
    await page.goto('/app/hearing/test');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/login')) {
      test.skip(true, 'Requires authenticated session');
    }
  });

  test('page renders without crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test('shows either habit reminder card or tone step card', async ({ page }) => {
    const habitCard = page.locator('[class*="no-habits"], [class*="card"]');
    await expect(habitCard.first()).toBeVisible();
  });

  test('play button or navigation button is visible', async ({ page }) => {
    const actionBtn = page.locator('button');
    const count = await actionBtn.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ── Navigation flows ──────────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await ensureInApp(page);
  });

  test('navigating to /app/monitor renders monitor page', async ({ page }) => {
    await page.goto('/app/monitor');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/monitor');
  });

  test('navigating to /app/history renders history page', async ({ page }) => {
    await page.goto('/app/history');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/history');
  });

  test('navigating to /app/profile renders profile page', async ({ page }) => {
    await page.goto('/app/profile');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/profile');
  });

  test('navigating to /app/devices renders devices page', async ({ page }) => {
    await page.goto('/app/devices');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/devices');
  });
});

// ── Accessibility basics ──────────────────────────────────────────────────────

test.describe('Accessibility — keyboard and ARIA', () => {
  test.beforeEach(async ({ page }) => {
    await ensureInApp(page);
  });

  test('login page: email input has label or aria-label', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]');
    const id = await emailInput.getAttribute('id');
    const ariaLabel = await emailInput.getAttribute('aria-label');

    const hasLabel = id
      ? (await page.locator(`label[for="${id}"]`).count()) > 0
      : false;

    expect(hasLabel || !!ariaLabel).toBe(true);
  });

  test('dashboard has landmark regions (main or nav)', async ({ page }) => {
    await page.goto('/app/dashboard');
    await page.waitForLoadState('networkidle');

    const landmarks = await page
      .locator('main, nav, [role="main"], [role="navigation"]')
      .count();
    expect(landmarks).toBeGreaterThan(0);
  });
});

// ── Performance basics ────────────────────────────────────────────────────────

test.describe('Performance — page load', () => {
  test('login page loads in under 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('dashboard loads in under 8 seconds (including API)', async ({ page }) => {
    const start = Date.now();
    await page.goto('/app/dashboard');
    await page.waitForLoadState('networkidle');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(8000);
  });
});
