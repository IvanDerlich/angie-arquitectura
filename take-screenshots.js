const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch();
    
    // Desktop screenshot
    const desktopPage = await browser.newPage({
        viewport: { width: 1920, height: 1080 }
    });
    await desktopPage.goto('http://localhost:8000');
    await desktopPage.waitForLoadState('networkidle');
    await desktopPage.waitForTimeout(2000); // Wait for 3D initialization
    await desktopPage.screenshot({
        path: 'test-screenshots/hero-exhibition-desktop.png',
        fullPage: false
    });
    await desktopPage.close();
    
    // Mobile screenshot
    const mobilePage = await browser.newPage({
        viewport: { width: 375, height: 667 }
    });
    await mobilePage.goto('http://localhost:8000');
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({
        path: 'test-screenshots/hero-exhibition-mobile.png',
        fullPage: false
    });
    await mobilePage.close();
    
    await browser.close();
    console.log('Screenshots saved to test-screenshots/');
})();
