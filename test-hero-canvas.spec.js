const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test.describe('Hero Canvas Rendering', () => {
  
  test('landscape terrain renders with blue valleys', async ({ page }) => {
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
    
    // Wait for scene to initialize (Three.js with longer delay for terrain animation)
    await page.waitForTimeout(2000);
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
    
    // Verify canvas has blue-dominant pixels (terrain valleys)
    const pixelAnalysis = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { hasBlue: false, blueCount: 0, totalSamples: 0, samplePixels: [] };
      
      // Read WebGL pixels directly using readPixels
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      
      // Sample multiple points across the canvas
      const samples = 100;
      let blueCount = 0;
      const samplePixels = [];
      
      for (let i = 0; i < samples; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        const idx = (y * width + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        
        // Store sample for debugging
        if (i < 10) {
          samplePixels.push({ r, g, b, x, y });
        }
        
        // Check if blue is dominant (b > r+30)
        if (b > r + 30) {
          blueCount++;
        }
      }
      
      // At least 15% of sampled pixels should be blue-dominant
      return {
        hasBlue: blueCount >= samples * 0.15,
        blueCount,
        totalSamples: samples,
        samplePixels
      };
    });
    
    expect(pixelAnalysis.hasBlue).toBe(true);
  });
  
  test('landscape terrain renders on mobile with blue valleys', async ({ page }) => {
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
    await page.waitForTimeout(2000);
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
    
    // Check art is visible on mobile (height >= 45vh)
    const artHeight = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas ? canvas.getBoundingClientRect().height : 0;
    });
    
    expect(artHeight).toBeGreaterThanOrEqual(844 * 0.45);
    
    // Verify blue-dominant pixels on mobile too
    const pixelAnalysis = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { hasBlue: false, blueCount: 0, totalSamples: 0 };
      
      // Read WebGL pixels directly
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      
      const samples = 100;
      let blueCount = 0;
      
      for (let i = 0; i < samples; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        const idx = (y * width + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        
        if (b > r + 30) {
          blueCount++;
        }
      }
      
      return {
        hasBlue: blueCount >= samples * 0.15,
        blueCount,
        totalSamples: samples
      };
    });
    
    expect(pixelAnalysis.hasBlue).toBe(true);
  });
});
