const { test, expect } = require('@playwright/test');

test('mobile 390x844: room images must be >= 340px wide', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    // Get all visible room view images
    const images = await page.locator('.room-view__img').all();
    
    expect(images.length).toBeGreaterThan(0);
    
    // Check each visible image
    for (const img of images) {
        const isVisible = await img.isVisible();
        if (isVisible) {
            const box = await img.boundingBox();
            expect(box).not.toBeNull();
            expect(box.width).toBeGreaterThanOrEqual(340);
        }
    }
});
