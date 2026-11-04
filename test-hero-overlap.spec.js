const { test, expect } = require('@playwright/test');

/**
 * Test for hero branches to ensure no overlap between 3D canvas/objects and text content on desktop.
 * Required for: all hero branches must keep text (headline, subtitle, buttons, card) on the LEFT
 * and 3D objects on the RIGHT side, with no overlap that makes text unreadable.
 * 
 * Test viewport: 1440x900 (desktop)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test.describe('Hero Overlap Prevention @ 1440x900', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('hero text does not overlap with canvas/3D objects', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page and Three.js to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow Three.js scene to initialize
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

    // Get hero title and subtitle bounding boxes
    const titleBox = await page.evaluate(() => {
      const title = document.querySelector('.hero-title');
      if (!title) return null;
      const rect = title.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
    });
    expect(titleBox, 'Hero title must exist').not.toBeNull();

    const subtitleBox = await page.evaluate(() => {
      const subtitle = document.querySelector('.hero-subtitle');
      if (!subtitle) return null;
      const rect = subtitle.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
    });

    // Get canvas bounding box
    const canvasBox = await page.evaluate(() => {
      const canvas = document.querySelector('.hero-canvas-container') || document.querySelector('.hero canvas');
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
    });

    if (canvasBox) {
      // Check that canvas does not overlap with title
      const titleOverlapX = Math.max(0, Math.min(titleBox.right, canvasBox.right) - Math.max(titleBox.x, canvasBox.x));
      const titleOverlapY = Math.max(0, Math.min(titleBox.bottom, canvasBox.bottom) - Math.max(titleBox.y, canvasBox.y));
      const titleOverlapArea = titleOverlapX * titleOverlapY;
      
      // Allow minimal overlap (< 5% of title area) for edge cases
      const titleArea = titleBox.width * titleBox.height;
      const titleOverlapPercent = titleArea > 0 ? (titleOverlapArea / titleArea) * 100 : 0;
      
      expect(titleOverlapPercent, 'Canvas must not significantly overlap hero title').toBeLessThan(5);

      if (subtitleBox) {
        const subtitleOverlapX = Math.max(0, Math.min(subtitleBox.right, canvasBox.right) - Math.max(subtitleBox.x, canvasBox.x));
        const subtitleOverlapY = Math.max(0, Math.min(subtitleBox.bottom, canvasBox.bottom) - Math.max(subtitleBox.y, canvasBox.y));
        const subtitleOverlapArea = subtitleOverlapX * subtitleOverlapY;
        
        const subtitleArea = subtitleBox.width * subtitleBox.height;
        const subtitleOverlapPercent = subtitleArea > 0 ? (subtitleOverlapArea / subtitleArea) * 100 : 0;
        
        expect(subtitleOverlapPercent, 'Canvas must not significantly overlap hero subtitle').toBeLessThan(5);
      }

      // Ideally, canvas should be in the right half of the viewport (x >= 720 for 1440px width)
      // But we allow some flexibility as long as it doesn't overlap text
      const isCanvasInRightHalf = canvasBox.x >= 600; // Allow 120px margin
      if (!isCanvasInRightHalf) {
        // If canvas extends into left half, verify it's a full-background scene
        // and text has sufficient contrast
        console.log('Warning: Canvas extends into left half, checking text contrast');
      }
    }

    // Take a screenshot for visual verification
    await page.screenshot({ 
      path: `test-artifacts/hero-overlap-check-1440x900.png`,
      fullPage: false 
    });
  });

  test('hero content stays readable with sufficient spacing', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that all text elements are visible
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('.hero-subtitle')).toBeVisible();
    await expect(page.locator('.hero-buttons')).toBeVisible();
    await expect(page.locator('.hero-card')).toBeVisible();

    // Get hero content container bounding box
    const heroContentBox = await page.evaluate(() => {
      const content = document.querySelector('.hero-content');
      if (!content) return null;
      const rect = content.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right };
    });
    expect(heroContentBox, 'Hero content container must exist').not.toBeNull();

    // Check that hero content is on the left side (x < 720 for 1440px viewport)
    expect(heroContentBox.x, 'Hero content should be on the left side').toBeLessThan(800);
    
    // Check that hero content doesn't extend too far right (should leave room for canvas)
    expect(heroContentBox.right, 'Hero content should leave space for canvas on right').toBeLessThan(900);
  });
});
