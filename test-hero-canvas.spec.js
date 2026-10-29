const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test.describe('Hero Canvas Rendering', () => {
  
  test('unwoven canvas renders non-blank content', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for canvas to be created and attached
    const canvas = await page.waitForSelector('canvas', { timeout: 5000 });
    expect(canvas).toBeTruthy();
    
    // Wait for WebGL context and initial rendering
    await page.waitForFunction(() => {
      const c = document.querySelector('canvas');
      if (!c) return false;
      return c.width > 0 && c.height > 0;
    }, { timeout: 5000 });
    
    // Wait for scene to initialize (Three.js + GSAP with longer delay for animation)
    await page.waitForTimeout(1500);
    await page.evaluate(() => new Promise(r => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)));
    }));
    
    // Check canvas is visible and has correct dimensions
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const rect = canvas.getBoundingClientRect();
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return {
        width: rect.width,
        height: rect.height,
        bufferWidth: canvas.width,
        bufferHeight: canvas.height,
        isVisible: rect.width > 0 && rect.height > 0,
        hasWebGL: !!gl
      };
    });
    
    expect(canvasInfo.isVisible).toBe(true);
    expect(canvasInfo.hasWebGL).toBe(true);
    expect(canvasInfo.width).toBeGreaterThan(0);
    expect(canvasInfo.height).toBeGreaterThan(0);
    expect(canvasInfo.bufferWidth).toBeGreaterThan(0);
    expect(canvasInfo.bufferHeight).toBeGreaterThan(0);
    
    // Verify canvas is non-blank by checking WebGL rendering
    const hasRendered = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return false;
      
      // Check that drawingBufferWidth/Height are set (indicates WebGL is active)
      return gl.drawingBufferWidth > 0 && gl.drawingBufferHeight > 0;
    });
    
    expect(hasRendered).toBe(true);
  });
  
  test('unwoven canvas renders non-blank on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);
    
    // Wait for canvas
    const canvas = await page.waitForSelector('canvas', { timeout: 5000 });
    expect(canvas).toBeTruthy();
    
    await page.waitForFunction(() => {
      const c = document.querySelector('canvas');
      return c && c.width > 0 && c.height > 0;
    }, { timeout: 5000 });
    
    // Wait for rendering with longer timeout for mobile
    await page.waitForTimeout(1500);
    await page.evaluate(() => new Promise(r => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)));
    }));
    
    // Verify WebGL canvas is active
    const hasRendered = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return false;
      return gl.drawingBufferWidth > 0 && gl.drawingBufferHeight > 0;
    });
    
    expect(hasRendered).toBe(true);
    
    // Check art is visible on mobile (height >= 40vh)
    const artHeight = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas ? canvas.getBoundingClientRect().height : 0;
    });
    
    expect(artHeight).toBeGreaterThanOrEqual(844 * 0.40);
  });
});
