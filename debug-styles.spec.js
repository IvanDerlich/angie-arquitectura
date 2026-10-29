const { test } = require('@playwright/test');

test('debug mobile styles', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    const slideStyles = await page.locator('.room-slide').evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
            display: style.display,
            width: style.width,
            maxWidth: style.maxWidth,
            position: style.position,
            left: style.left,
            right: style.right
        };
    });
    
    const sceneStyles = await page.locator('.room-scene').evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
            width: style.width,
            maxWidth: style.maxWidth,
            margin: style.margin
        };
    });
    
    console.log('slide styles:', JSON.stringify(slideStyles, null, 2));
    console.log('scene styles:', JSON.stringify(sceneStyles, null, 2));
});
