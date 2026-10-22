const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://ivanderlich.github.io/angie-arquitectura/hero-demos';

const heroes = [
  { num: 1, name: 'Plano Generativo' },
  { num: 2, name: 'Volúmenes Isométricos' },
  { num: 3, name: 'Arcos de Luz' },
  { num: 4, name: 'Grid Interactivo' },
  { num: 5, name: 'Corte Arquitectónico' },
  { num: 6, name: 'Proporción Áurea' }
];

test.describe('Hero Demos', () => {
  test('index page loads and links to all 6 demos', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page).toHaveTitle(/Propuestas de Hero/);
    
    for (const hero of heroes) {
      const link = page.locator(`a[href="hero-${hero.num}.html"]`);
      await expect(link).toBeVisible();
    }

    expect(consoleErrors).toHaveLength(0);
  });

  heroes.forEach(hero => {
    test.describe(`Hero ${hero.num} (${hero.name})`, () => {
      test('loads without errors on desktop', async ({ page, viewport }) => {
        const consoleErrors = [];
        page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
        
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(`${BASE_URL}/hero-${hero.num}.html`);
        
        // Check hero title is visible
        const heroTitle = page.locator('.hero-title');
        await expect(heroTitle).toBeVisible();
        await expect(heroTitle).toContainText('Espacios para habitar');

        // Check NO img tags in hero section
        const heroImages = await page.locator('.hero img').count();
        expect(heroImages).toBe(0);

        // Check WhatsApp CTA exists and is in viewport
        const heroCTA = page.locator('.hero-buttons a[href*="wa.me"]').first();
        await expect(heroCTA).toBeVisible();
        const ctaBox = await heroCTA.boundingBox();
        expect(ctaBox).not.toBeNull();
        expect(ctaBox.y).toBeGreaterThan(0);
        expect(ctaBox.y + ctaBox.height).toBeLessThan(800);

        // Check no horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(1280);

        // Check no console errors
        expect(consoleErrors).toHaveLength(0);
      });

      test('works on mobile', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
        
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`${BASE_URL}/hero-${hero.num}.html`);
        
        // Check hero title is visible
        const heroTitle = page.locator('.hero-title');
        await expect(heroTitle).toBeVisible();

        // Check NO img tags in hero section
        const heroImages = await page.locator('.hero img').count();
        expect(heroImages).toBe(0);

        // Check WhatsApp CTA in hero section is visible and in viewport
        const heroCTA = page.locator('.hero-buttons a[href*="wa.me"]').first();
        await expect(heroCTA).toBeVisible();
        const ctaBox = await heroCTA.boundingBox();
        expect(ctaBox).not.toBeNull();
        expect(ctaBox.y).toBeGreaterThan(0);
        expect(ctaBox.y + ctaBox.height).toBeLessThan(844);

        // Check no horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(390);

        // Check no console errors
        expect(consoleErrors).toHaveLength(0);
      });
    });
  });
});
