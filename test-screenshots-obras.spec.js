const { test } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test.describe('Screenshots for Obras section', () => {
  test('desktop screenshot 1280x800', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL);
    
    // Scroll to Obras section
    await page.locator('#obras').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // Wait for images to load
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-screenshots/obras-desktop-1280x800.png',
      fullPage: true 
    });
  });

  test('mobile screenshot 390x844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);
    
    // Scroll to Obras section
    await page.locator('#obras').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // Wait for images to load
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-screenshots/obras-mobile-390x844.png',
      fullPage: true 
    });
  });
});
