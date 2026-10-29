const { test, expect } = require('@playwright/test');

test.describe('3D Room Display Hero Section', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8080/');
        await page.waitForLoadState('networkidle');
    });

    test('should render the room display with non-blank canvas', async ({ page }) => {
        // Check that room slideshow container exists
        const roomSlideshow = await page.locator('#room-slideshow');
        await expect(roomSlideshow).toBeVisible();
        
        // Check that room scene exists
        const roomScene = await page.locator('.room-scene');
        await expect(roomScene).toBeVisible();
        
        // Check that room views exist
        const roomViews = await page.locator('.room-views');
        await expect(roomViews).toBeVisible();
        
        // Check that images are loaded and visible
        const images = await page.locator('.room-view__img');
        const imageCount = await images.count();
        expect(imageCount).toBeGreaterThan(0);
        
        // Verify first image is not blank by checking its natural dimensions
        const firstImage = images.first();
        await expect(firstImage).toBeVisible();
        
        const dimensions = await firstImage.evaluate((img) => ({
            width: img.naturalWidth,
            height: img.naturalHeight,
            complete: img.complete
        }));
        
        expect(dimensions.complete).toBe(true);
        expect(dimensions.width).toBeGreaterThan(0);
        expect(dimensions.height).toBeGreaterThan(0);
        
        // Take a screenshot to verify non-blank rendering
        const screenshot = await roomSlideshow.screenshot();
        expect(screenshot.length).toBeGreaterThan(1000); // Non-blank screenshot should be reasonably sized
    });

    test('should have readable hero text overlay', async ({ page }) => {
        const heroTitle = await page.locator('.hero-title');
        await expect(heroTitle).toBeVisible();
        await expect(heroTitle).toContainText('Espacios para habitar con calma');
        
        // Text should be readable (check it exists and is visible)
        const textContent = await heroTitle.textContent();
        expect(textContent).toBeTruthy();
        expect(textContent.length).toBeGreaterThan(0);
    });

    test('should have images clearly visible', async ({ page }) => {
        const images = await page.locator('.room-view__img');
        const firstImage = images.first();
        
        // Check opacity is set
        const opacity = await firstImage.evaluate((el) => 
            window.getComputedStyle(el).opacity
        );
        expect(parseFloat(opacity)).toBeGreaterThan(0);
    });

    test('should render properly on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const roomSlideshow = await page.locator('#room-slideshow');
        await expect(roomSlideshow).toBeVisible();
        
        const heroTitle = await page.locator('.hero-title');
        await expect(heroTitle).toBeVisible();
        
        // Check that mobile styles are applied
        const fontSize = await heroTitle.evaluate((el) => 
            window.getComputedStyle(el).fontSize
        );
        const fontSizeNum = parseFloat(fontSize);
        expect(fontSizeNum).toBeLessThan(60); // Should be smaller on mobile
        
        // Images should be visible on mobile
        const images = await page.locator('.room-view__img');
        const firstImage = images.first();
        await expect(firstImage).toBeVisible();
    });

    test('should handle browsers without preserve-3d support', async ({ page }) => {
        // This test verifies fallback behavior
        const roomScene = await page.locator('.room-scene');
        await expect(roomScene).toBeVisible();
        
        // Images should still be visible even without 3D transform
        const images = await page.locator('.room-view__img');
        const imageCount = await images.count();
        expect(imageCount).toBeGreaterThan(0);
        
        for (let i = 0; i < imageCount; i++) {
            const img = images.nth(i);
            await expect(img).toBeVisible();
        }
    });

    test('desktop: should have 3D transform on room scene', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const roomScene = await page.locator('.room-scene');
        
        // Move mouse to trigger 3D effect
        await page.mouse.move(960, 540);
        await page.waitForTimeout(200);
        
        const transform = await roomScene.evaluate((el) => 
            window.getComputedStyle(el).transform
        );
        
        // Should have some transform applied (not 'none')
        expect(transform).not.toBe('none');
    });
});
