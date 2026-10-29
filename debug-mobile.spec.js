const { test } = require('@playwright/test');

test('debug mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    // Check all the widths
    const slideshow = await page.locator('.room-slideshow').boundingBox();
    const slide = await page.locator('.room-slide').boundingBox();
    const scene = await page.locator('.room-scene').boundingBox();
    const views = await page.locator('.room-views').boundingBox();
    const view1 = await page.locator('.room-view').first().boundingBox();
    const img1 = await page.locator('.room-view__img').first().boundingBox();
    
    console.log('slideshow:', slideshow?.width);
    console.log('slide:', slide?.width);
    console.log('scene:', scene?.width);
    console.log('views:', views?.width);
    console.log('view1:', view1?.width);
    console.log('img1:', img1?.width);
    
    // Check computed styles
    const viewsDisplay = await page.locator('.room-views').evaluate(el => 
        window.getComputedStyle(el).display
    );
    console.log('views display:', viewsDisplay);
});
