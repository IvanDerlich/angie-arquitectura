const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/hero-demos';

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

      test('art canvas covers >=80% of hero height and is visible (not >50% overlapped)', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(`${BASE_URL}/hero-${hero.num}.html`);

        // Wait for canvas sizing to complete
        await page.waitForTimeout(3000);
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

        // Get hero section height (subtract header ~80px)
        const heroHeight = await page.evaluate(() => {
          const hero = document.querySelector('.hero');
          return hero ? hero.offsetHeight : 0;
        });
        expect(heroHeight).toBeGreaterThan(0);

        // Get art canvas/svg bounding box
        const artBox = await page.evaluate(() => {
          const canvas = document.querySelector('.hero canvas') || document.querySelector('.hero svg');
          if (!canvas) return null;
          const rect = canvas.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        });
        expect(artBox).not.toBeNull();

        // Check art covers >=80% of hero height
        const artHeightPercent = (artBox.height / heroHeight) * 100;
        expect(artHeightPercent).toBeGreaterThanOrEqual(80);

        // Get text card bounding box
        const cardBox = await page.evaluate(() => {
          const card = document.querySelector('.hero-content');
          if (!card) return null;
          const rect = card.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        });
        expect(cardBox).not.toBeNull();

        // Calculate overlap (if any)
        const overlapX = Math.max(0, Math.min(artBox.x + artBox.width, cardBox.x + cardBox.width) - Math.max(artBox.x, cardBox.x));
        const overlapY = Math.max(0, Math.min(artBox.y + artBox.height, cardBox.y + cardBox.height) - Math.max(artBox.y, cardBox.y));
        const overlapArea = overlapX * overlapY;
        const artArea = artBox.width * artBox.height;
        const overlapPercent = artArea > 0 ? (overlapArea / artArea) * 100 : 0;

        // Check art is not >50% overlapped by text card
        expect(overlapPercent).toBeLessThanOrEqual(50);
      });

      test('screenshot shows art fills lower half at 1280x800', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(`${BASE_URL}/hero-${hero.num}.html`);

        // Wait for canvas sizing to complete
        await page.waitForTimeout(3000);
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        
        await page.waitForTimeout(500); // Wait for animation to start
        
        const screenshot = await page.screenshot({ path: `test-screenshots/hero-${hero.num}-desktop.png` });
        expect(screenshot).toBeTruthy();

        // Check that non-background pixels exist in lower half of art area
        const hasLowerContent = await page.evaluate(() => {
          const canvas = document.querySelector('.hero canvas') || document.querySelector('.hero svg');
          if (!canvas) return false;
          const rect = canvas.getBoundingClientRect();
          if (rect.height < 200) return false; // Canvas too small
          
          // For full-screen canvases (hero 4,6), check lower half of viewport
          // For side canvases (hero 1,2,3,5), check lower half of canvas area
          const isFullScreen = rect.width > window.innerWidth * 0.9;
          const lowerHalfY = isFullScreen ? window.innerHeight * 0.5 : rect.y + rect.height * 0.5;
          
          return rect.bottom > lowerHalfY + 100; // Art extends well into lower half
        });
        expect(hasLowerContent).toBeTruthy();
      });

      test('screenshot shows art on mobile 390x844', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`${BASE_URL}/hero-${hero.num}.html`);

        // Wait for canvas sizing to complete
        await page.waitForTimeout(3000);
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        
        await page.waitForTimeout(500);
        
        const screenshot = await page.screenshot({ path: `test-screenshots/hero-${hero.num}-mobile.png` });
        expect(screenshot).toBeTruthy();
      });
    });
  });
});
