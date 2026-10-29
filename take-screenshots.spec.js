const { test } = require('@playwright/test');

test('capture desktop screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for any animations
    await page.screenshot({ path: 'test-screenshots/hero-room-desktop.png', fullPage: false });
});

test('capture mobile screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/hero-room-mobile.png', fullPage: false });
});
