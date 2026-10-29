const { test } = require('@playwright/test');

test('capture mobile at 390x844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/hero-room-mobile-390x844.png', fullPage: false });
});
