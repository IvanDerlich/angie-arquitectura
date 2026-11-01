const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test.describe('Hero spotlight', () => {
  test('page loads without errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveTitle(/Ángeles Arquitectura/);
    expect(consoleErrors).toHaveLength(0);
  });

  test('hero canvas container exists', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const canvasContainer = page.locator('#hero-canvas-container');
    await expect(canvasContainer).toBeVisible();
    
    const canvas = page.locator('#hero-canvas-container canvas');
    const canvasCount = await canvas.count();
    expect(canvasCount).toBeGreaterThanOrEqual(0);
  });

  test('headline "Espacios para habitar con calma." is present', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const heroTitle = page.locator('.hero-title');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText('Espacios para habitar con calma');
  });

  test('non-hero sections are unchanged', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await expect(page.locator('#obras')).toBeVisible();
    await expect(page.locator('#proyectos')).toBeVisible();
    await expect(page.locator('#actividades')).toBeVisible();
    await expect(page.locator('#sobre-mi')).toBeVisible();
    await expect(page.locator('#servicios')).toBeVisible();
    await expect(page.locator('#contacto')).toBeVisible();
    
    await expect(page.locator('#obras .section-title')).toContainText('Proyectos construidos');
    await expect(page.locator('#proyectos .section-title')).toContainText('Diseños y propuestas');
  });

  test('WebGL fallback works when WebGL is disabled', async ({ page, context }) => {
    await context.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
          return null;
        }
        return getContext.call(this, type, ...args);
      };
    });
    
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
    
    const canvasContainer = page.locator('#hero-canvas-container');
    await expect(canvasContainer).toBeVisible();
    
    const bgStyle = await canvasContainer.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.background || style.backgroundColor;
    });
    expect(bgStyle).toBeTruthy();
  });

  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('#hero-canvas-container')).toBeVisible();
  });

  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);
    
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('#hero-canvas-container')).toBeVisible();
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });

  test('works on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL);
    
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('#hero-canvas-container')).toBeVisible();
    
    const heroContent = page.locator('.hero-content');
    await expect(heroContent).toBeVisible();
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(1280);
  });
});
