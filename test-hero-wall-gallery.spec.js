const { test, expect } = require('@playwright/test');
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test.describe('Hero Wall Gallery WebGL', () => {
    test('hero canvas renders', async ({ page }) => {
        await page.goto(BASE_URL);
        const canvas = page.locator('#hero-canvas-container canvas');
        await expect(canvas).toBeVisible();
    });
    
    test('hero text visible with headline', async ({ page }) => {
        await page.goto(BASE_URL);
        const heroTitle = page.locator('.hero-title');
        await expect(heroTitle).toContainText('Espacios para habitar con calma');
    });
    
    test('non-hero sections unchanged', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('#obras .section-title')).toContainText('Proyectos construidos');
    });
});
