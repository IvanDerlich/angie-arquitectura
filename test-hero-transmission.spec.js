const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test.describe('Hero Transmission WebGL', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('hero canvas renders on desktop', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const canvas = page.locator('#hero-canvas-container canvas');
        await expect(canvas).toBeVisible();
        
        await page.waitForTimeout(1000);
        
        const heroSection = page.locator('#hero');
        await expect(heroSection).toBeVisible();
    });

    test('hero canvas is non-blank and renders content', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const canvas = page.locator('#hero-canvas-container canvas');
        await expect(canvas).toBeVisible();
        
        await page.waitForTimeout(3000);
        
        const screenshot = await canvas.screenshot();
        expect(screenshot.length).toBeGreaterThan(5000);
        
        const hasRenderedContent = await page.evaluate(() => {
            const canvas = document.querySelector('#hero-canvas-container canvas');
            if (!canvas) return false;
            
            return canvas.width > 0 && canvas.height > 0;
        });
        
        expect(hasRenderedContent).toBe(true);
    });

    test('hero text is readable with overlay', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const heroTitle = page.locator('.hero-title');
        await expect(heroTitle).toBeVisible();
        await expect(heroTitle).toContainText('Espacios para habitar con calma');
        
        const heroSubtitle = page.locator('.hero-subtitle');
        await expect(heroSubtitle).toBeVisible();
        
        const heroButtons = page.locator('.hero-buttons');
        await expect(heroButtons).toBeVisible();
        
        const titleColor = await heroTitle.evaluate((el) => {
            return window.getComputedStyle(el).color;
        });
        expect(titleColor).toBeTruthy();
    });

    test('hero maintains proper z-index layering', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const canvasContainer = page.locator('#hero-canvas-container');
        const overlay = page.locator('.hero-overlay');
        const content = page.locator('.hero-content');
        
        const canvasZIndex = await canvasContainer.evaluate((el) => 
            window.getComputedStyle(el).zIndex
        );
        const overlayZIndex = await overlay.evaluate((el) => 
            window.getComputedStyle(el).zIndex
        );
        const contentZIndex = await content.evaluate((el) => 
            window.getComputedStyle(el).zIndex
        );
        
        expect(parseInt(canvasZIndex)).toBe(0);
        expect(parseInt(overlayZIndex)).toBe(1);
        expect(parseInt(contentZIndex)).toBe(2);
    });
});

test.describe('Hero Transmission WebGL - Mobile', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('hero canvas renders on mobile', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const canvas = page.locator('#hero-canvas-container canvas');
        await expect(canvas).toBeVisible();
        
        await page.waitForTimeout(1000);
        
        const heroSection = page.locator('#hero');
        await expect(heroSection).toBeVisible();
    });

    test('hero text is readable on mobile', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const heroTitle = page.locator('.hero-title');
        await expect(heroTitle).toBeVisible();
        
        const heroButtons = page.locator('.hero-buttons');
        await expect(heroButtons).toBeVisible();
        
        const heroCard = page.locator('.hero-card');
        await expect(heroCard).toBeVisible();
    });

    test('canvas is crisp and full opacity on mobile', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const canvasContainer = page.locator('#hero-canvas-container');
        
        const opacity = await canvasContainer.evaluate((el) => 
            window.getComputedStyle(el).opacity
        );
        
        expect(parseFloat(opacity)).toBe(1);
        
        const position = await canvasContainer.evaluate((el) => 
            window.getComputedStyle(el).position
        );
        
        expect(position).toBe('relative');
    });
});

test.describe('Hero Transmission - Screenshots', () => {
    test('desktop hero screenshot', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(BASE_URL);
        
        await page.waitForTimeout(2000);
        
        const heroSection = page.locator('#hero');
        await heroSection.screenshot({ 
            path: 'test-artifacts/hero-transmission-desktop.png',
            animations: 'disabled'
        });
    });

    test('mobile hero screenshot 390x844', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(BASE_URL);
        
        await page.waitForTimeout(2000);
        
        const heroSection = page.locator('#hero');
        await heroSection.screenshot({ 
            path: 'test-artifacts/hero-transmission-mobile-390x844.png',
            animations: 'disabled'
        });
    });

    test('mobile hero screenshot 375x667', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(BASE_URL);
        
        await page.waitForTimeout(2000);
        
        const heroSection = page.locator('#hero');
        await heroSection.screenshot({ 
            path: 'test-artifacts/hero-transmission-mobile-375x667.png',
            animations: 'disabled'
        });
    });
});
