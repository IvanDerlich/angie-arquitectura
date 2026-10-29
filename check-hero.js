const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch();
    
    // Desktop check
    console.log('=== DESKTOP (1280x800) ===');
    const desktopPage = await browser.newPage({
        viewport: { width: 1280, height: 800 }
    });
    await desktopPage.goto('http://localhost:8000');
    await desktopPage.waitForLoadState('networkidle');
    await desktopPage.waitForTimeout(2000);
    
    // Check what's visible
    const galleryVisible = await desktopPage.locator('.hero-gallery-container').isVisible();
    console.log('Gallery container visible:', galleryVisible);
    
    const roomVisible = await desktopPage.locator('.hero-gallery-room--current').isVisible();
    console.log('Current room visible:', roomVisible);
    
    const images = await desktopPage.locator('.hero-gallery-room__img').all();
    console.log('Number of images:', images.length);
    
    if (images.length > 0) {
        const firstImg = await images[0].boundingBox();
        console.log('First image dimensions:', firstImg);
    }
    
    const titleVisible = await desktopPage.locator('.hero-title').isVisible();
    console.log('Title visible:', titleVisible);
    
    const transform = await desktopPage.locator('.hero-gallery-scroller').evaluate(el => 
        window.getComputedStyle(el).transform
    );
    console.log('Transform applied:', transform !== 'none');
    
    await desktopPage.screenshot({
        path: 'test-screenshots/hero-exhibition-desktop.png',
        fullPage: false
    });
    console.log('Desktop screenshot saved');
    
    await desktopPage.close();
    
    // Mobile check
    console.log('\n=== MOBILE (390x844) ===');
    const mobilePage = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });
    await mobilePage.goto('http://localhost:8000');
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.waitForTimeout(2000);
    
    const mobileTitleVisible = await mobilePage.locator('.hero-title').isVisible();
    console.log('Title visible:', mobileTitleVisible);
    
    const mobileImages = await mobilePage.locator('.hero-gallery-room__img').all();
    console.log('Number of images:', mobileImages.length);
    
    await mobilePage.screenshot({
        path: 'test-screenshots/hero-exhibition-mobile.png',
        fullPage: false
    });
    console.log('Mobile screenshot saved');
    
    await mobilePage.close();
    await browser.close();
})();
