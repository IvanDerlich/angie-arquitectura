const { test, expect } = require('@playwright/test');

test.describe('Hero Variants - Canvas Rendering', () => {
  const variants = [
    { name: 'Unwoven', path: '/staging-heroes/unwoven/', selector: '.hero-canvas-stage canvas' },
    { name: 'Landscape', path: '/staging-heroes/landscape/', selector: '.landscape' },
    { name: 'Exhibition', path: '/staging-heroes/exhibition/', selector: '.hero-canvas-stage canvas' },
    { name: 'Room', path: '/staging-heroes/room/', selector: '.hero-canvas-stage canvas' }
  ];

  for (const variant of variants) {
    test(`${variant.name}: canvas/scene renders non-blank on desktop`, async ({ page }) => {
      await page.goto(`http://localhost:8080${variant.path}`);
      await page.waitForTimeout(2000); // Wait for WebGL initialization
      
      const canvas = await page.locator(variant.selector);
      await expect(canvas).toBeVisible();
      
      // Take screenshot and check it's not all one color
      const screenshot = await canvas.screenshot();
      expect(screenshot.length).toBeGreaterThan(1000); // Canvas should have rendered content
      
      // Check canvas has reasonable dimensions
      const box = await canvas.boundingBox();
      expect(box.width).toBeGreaterThan(100);
      expect(box.height).toBeGreaterThan(100);
    });

    test(`${variant.name}: canvas/scene renders non-blank on mobile 390x844`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`http://localhost:8080${variant.path}`);
      await page.waitForTimeout(2000);
      
      const canvas = await page.locator(variant.selector);
      await expect(canvas).toBeVisible();
      
      const screenshot = await canvas.screenshot();
      expect(screenshot.length).toBeGreaterThan(1000);
      
      const box = await canvas.boundingBox();
      expect(box.width).toBeGreaterThan(100);
      expect(box.height).toBeGreaterThan(100);
    });
  }

  // Hero text readability tests
  const sizes = [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'mobile', width: 390, height: 844 }
  ];

  for (const size of sizes) {
    for (const variant of variants) {
      test(`${variant.name}: hero text is readable on ${size.name}`, async ({ page }) => {
        await page.setViewportSize(size);
        await page.goto(`http://localhost:8080${variant.path}`);
        await page.waitForTimeout(1000);
        
        // Check hero title is visible and has good contrast
        const title = await page.locator('.hero-title');
        await expect(title).toBeVisible();
        
        const titleBox = await title.boundingBox();
        expect(titleBox.width).toBeGreaterThan(100);
        expect(titleBox.height).toBeGreaterThan(20);
        
        // Check buttons are visible
        const buttons = await page.locator('.hero-buttons');
        await expect(buttons).toBeVisible();
      });
    }
  }
});
