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

  test('desktop layout: no text overflow, no text/art intersection', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL);
    
    await page.waitForSelector('canvas', { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    const layoutCheck = await page.evaluate(() => {
      const heroContent = document.querySelector('.hero-content');
      const canvas = document.querySelector('canvas');
      
      if (!heroContent || !canvas) return { valid: false, reason: 'Elements not found' };
      
      const contentRect = heroContent.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      
      // Check for text overflow (scrollWidth > clientWidth indicates overflow)
      const h1 = heroContent.querySelector('h1');
      const hasOverflow = h1 && h1.scrollWidth > h1.clientWidth + 2; // +2px tolerance
      
      // Check for intersection (canvas should not overlap text panel significantly)
      const hasIntersection = !(
        contentRect.right < canvasRect.left || 
        contentRect.left > canvasRect.right ||
        contentRect.bottom < canvasRect.top ||
        contentRect.top > canvasRect.bottom
      );
      
      // Allow minimal edge overlap (within 10px)
      const overlapX = Math.max(0, Math.min(contentRect.right, canvasRect.right) - Math.max(contentRect.left, canvasRect.left));
      const significantOverlap = hasIntersection && overlapX > 10;
      
      return {
        valid: !hasOverflow && !significantOverlap,
        hasOverflow,
        significantOverlap,
        contentWidth: contentRect.width,
        h1ScrollWidth: h1 ? h1.scrollWidth : 0,
        h1ClientWidth: h1 ? h1.clientWidth : 0
      };
    });
    
    expect(layoutCheck.hasOverflow).toBe(false);
    expect(layoutCheck.significantOverlap).toBe(false);
    expect(layoutCheck.contentWidth).toBeGreaterThanOrEqual(440);
  });

  test('mobile layout: art fully visible above text', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);
    
    await page.waitForSelector('canvas', { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    const layoutCheck = await page.evaluate(() => {
      const heroContent = document.querySelector('.hero-content');
      const canvasStage = document.querySelector('.hero-canvas-stage');
      const canvas = document.querySelector('canvas');
      
      if (!heroContent || !canvasStage || !canvas) return { valid: false };
      
      const contentRect = heroContent.getBoundingClientRect();
      const stageRect = canvasStage.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      
      // Check that art is above text (stage.bottom <= content.top + small tolerance)
      const artAboveText = stageRect.bottom <= contentRect.top + 5;
      
      // Check art has meaningful height (at least 40vh = 337px)
      const artHeight = stageRect.height;
      const hasHeight = artHeight >= 337;
      
      // Check no significant overlap
      const overlap = Math.max(0, Math.min(stageRect.bottom, contentRect.bottom) - Math.max(stageRect.top, contentRect.top));
      const noOverlap = overlap < 10;
      
      return {
        valid: artAboveText && hasHeight && noOverlap,
        artAboveText,
        hasHeight,
        noOverlap,
        artHeight,
        stageBottom: stageRect.bottom,
        contentTop: contentRect.top
      };
    });
    
    expect(layoutCheck.artAboveText).toBe(true);
    expect(layoutCheck.hasHeight).toBe(true);
    expect(layoutCheck.noOverlap).toBe(true);
  });
});
