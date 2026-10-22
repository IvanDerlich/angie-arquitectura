const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://ivanderlich.github.io/angie-arquitectura';

const demos = [
  { num: 1, name: 'Blueprint Draw', title: 'Espacios para habitar con calma' },
  { num: 2, name: 'Render to Real', title: 'Espacios para habitar con calma' },
  { num: 3, name: 'Architectural Panels', title: 'Espacios para habitar con calma' },
  { num: 4, name: 'Ken Burns', title: 'Espacios para habitar con calma' },
  { num: 5, name: 'Scroll-Driven', title: 'Espacios para habitar con calma' },
  { num: 6, name: 'Minimal Typographic', title: 'Espacios para habitar con calma' }
];

test.describe('Hero Demos', () => {
  test('index page loads and links to all 6 demos', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/hero-demos/?t=${Date.now()}`);
    await page.waitForLoadState('networkidle');

    // Check all 6 demo links exist
    for (let i = 1; i <= 6; i++) {
      const link = page.locator(`a[href="hero-${i}.html"]`);
      await expect(link).toBeVisible();
    }

    // Check title
    await expect(page.locator('h1')).toContainText('Propuestas');

    // No console errors
    expect(consoleErrors).toHaveLength(0);
  });

  for (const demo of demos) {
    test(`Hero ${demo.num} (${demo.name}) loads without errors`, async ({ page }) => {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto(`${BASE_URL}/hero-demos/hero-${demo.num}.html?t=${Date.now()}`);
      await page.waitForLoadState('networkidle');

      // Check hero title exists
      const heroTitle = page.locator('.hero-title, .hero-title-large');
      await expect(heroTitle).toBeVisible();
      
      const titleText = await heroTitle.textContent();
      expect(titleText).toContain('habitar');

      // Check WhatsApp CTA exists
      const waCTA = page.locator('a[href*="wa.me"]').first();
      await expect(waCTA).toBeVisible();

      // Check header logo
      await expect(page.locator('.logo')).toContainText('Ángeles');

      // No console errors
      expect(consoleErrors).toHaveLength(0);
    });

    test(`Hero ${demo.num} works on mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(`${BASE_URL}/hero-demos/hero-${demo.num}.html?t=${Date.now()}`);
      await page.waitForLoadState('networkidle');

      // Check title is visible
      const heroTitle = page.locator('.hero-title, .hero-title-large');
      await expect(heroTitle).toBeVisible();

      // Check CTA in hero buttons (not header) is visible
      const heroCTA = page.locator('.hero-buttons a[href*="wa.me"]').first();
      await expect(heroCTA).toBeVisible();
    });
  }
});
