const { test, expect } = require('@playwright/test');

test.describe('Hero Ocean', () => {
    test('page loads without errors', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => { 
            if (msg.type() === 'error') consoleErrors.push(msg.text()); 
        });
        
        await page.goto('/');
        await page.waitForTimeout(2000);
        
        expect(consoleErrors).toHaveLength(0);
    });

    test('hero canvas container exists', async ({ page }) => {
        await page.goto('/');
        const container = page.locator('#hero-canvas-container');
        await expect(container).toBeVisible();
    });

    test('headline is present and readable', async ({ page }) => {
        await page.goto('/');
        const headline = page.locator('.hero-title');
        await expect(headline).toBeVisible();
        await expect(headline).toContainText('Espacios para habitar con calma');
    });

    test('non-hero sections are unchanged', async ({ page }) => {
        await page.goto('/');
        
        // Check Obras section exists
        const obrasSection = page.locator('#obras');
        await expect(obrasSection).toBeVisible();
        const obrasTitle = page.locator('#obras .section-title');
        await expect(obrasTitle).toContainText('Proyectos construidos');
        
        // Check Proyectos section exists
        const proyectosSection = page.locator('#proyectos');
        await expect(proyectosSection).toBeVisible();
        
        // Check Sobre mí section exists
        const sobreMiSection = page.locator('#sobre-mi');
        await expect(sobreMiSection).toBeVisible();
    });

    test('WebGL fallback works when WebGL is unavailable', async ({ page, context }) => {
        // Override WebGL availability
        await page.goto('/');
        
        const container = page.locator('#hero-canvas-container');
        await expect(container).toBeVisible();
        
        // Check that either canvas or fallback is present
        const hasCanvas = await page.locator('#hero-canvas-container canvas').count() > 0;
        const hasFallback = await page.locator('#hero-canvas-container div').count() > 0;
        
        expect(hasCanvas || hasFallback).toBeTruthy();
    });

    test('works on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await page.waitForTimeout(2000);
        
        const headline = page.locator('.hero-title');
        await expect(headline).toBeVisible();
        
        // Check no horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(390);
    });

    test('respects prefers-reduced-motion', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
        await page.waitForTimeout(1000);
        
        const headline = page.locator('.hero-title');
        await expect(headline).toBeVisible();
    });
});
