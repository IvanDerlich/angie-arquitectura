const { test, expect } = require('@playwright/test');

test.describe('Hero Exhibition Gallery', () => {
    test('should render exhibition gallery with non-blank canvas', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Wait for hero section to be visible
        await page.waitForSelector('.hero-gallery-container', { state: 'visible', timeout: 10000 });
        
        // Wait for images to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        // Check that the 3D room structure exists
        const heroContainer = await page.locator('.hero-gallery-container');
        await expect(heroContainer).toBeVisible();
        
        const heroScroller = await page.locator('.hero-gallery-scroller');
        await expect(heroScroller).toBeVisible();
        
        // Check that at least one room is visible
        const currentRoom = await page.locator('.hero-gallery-room--current');
        await expect(currentRoom).toBeVisible();
        
        // Check that images are loaded and visible
        const images = await page.locator('.hero-gallery-room__img').all();
        expect(images.length).toBeGreaterThan(0);
        
        // Verify first image is loaded and non-blank
        const firstImage = await page.locator('.hero-gallery-room__img').first();
        await expect(firstImage).toBeVisible();
        
        // Check that image has natural dimensions (is actually loaded)
        const naturalWidth = await firstImage.evaluate(img => img.naturalWidth);
        const naturalHeight = await firstImage.evaluate(img => img.naturalHeight);
        expect(naturalWidth).toBeGreaterThan(0);
        expect(naturalHeight).toBeGreaterThan(0);
        
        // Take a screenshot to verify rendering
        const screenshot = await page.screenshot();
        expect(screenshot).toBeTruthy();
        
        // Verify the hero has the expected 3D transform applied
        const transform = await heroScroller.evaluate(el => 
            window.getComputedStyle(el).transform
        );
        expect(transform).not.toBe('none');
        expect(transform).toContain('matrix3d');
    });
    
    test('should display content overlay with readable headline', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Wait for content
        await page.waitForSelector('.hero-content', { state: 'visible' });
        
        // Check headline is visible and readable
        const title = await page.locator('.hero-title');
        await expect(title).toBeVisible();
        
        const titleText = await title.textContent();
        expect(titleText).toContain('Espacios para habitar con calma');
        
        // Check subtitle is visible
        const subtitle = await page.locator('.hero-subtitle');
        await expect(subtitle).toBeVisible();
        
        // Verify buttons are clickable
        const buttons = await page.locator('.hero-buttons a');
        const buttonCount = await buttons.count();
        expect(buttonCount).toBeGreaterThanOrEqual(2);
    });
    
    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:8000');
        
        // Wait for hero to load
        await page.waitForSelector('.hero', { state: 'visible' });
        await page.waitForLoadState('networkidle');
        
        // Check that content is visible on mobile
        const heroContent = await page.locator('.hero-content');
        await expect(heroContent).toBeVisible();
        
        // Check that headline is readable
        const title = await page.locator('.hero-title');
        await expect(title).toBeVisible();
        
        const titleText = await title.textContent();
        expect(titleText.length).toBeGreaterThan(0);
        
        // Verify images are visible on mobile
        const visibleImages = await page.locator('.hero-gallery-room__img:visible');
        const count = await visibleImages.count();
        expect(count).toBeGreaterThan(0);
    });
});
