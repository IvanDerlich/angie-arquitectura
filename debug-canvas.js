const { chromium } = require('@playwright/test');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error));
    
    await page.goto('http://localhost:8080/');
    
    await page.waitForTimeout(3000);
    
    const canvasExists = await page.locator('#hero-canvas-container canvas').count();
    console.log('Canvas count:', canvasExists);
    
    const containerHTML = await page.locator('#hero-canvas-container').innerHTML().catch(() => 'not found');
    console.log('Container HTML:', containerHTML);
    
    await browser.close();
})();
