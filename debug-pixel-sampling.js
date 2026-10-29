const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(BASE_URL);
  
  // Wait for canvas
  await page.waitForSelector('canvas', { timeout: 5000 });
  await page.waitForTimeout(3000);
  
  // Debug pixel analysis
  const pixelData = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { error: 'No WebGL context' };
    
    // Read WebGL pixels
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    
    // Sample 20 random points
    const samples = [];
    let blueCount = 0;
    let totalNonBackground = 0;
    
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];
      
      // Skip near-white background pixels
      if (r < 240 || g < 240 || b < 240) {
        totalNonBackground++;
        if (b > r + 30) {
          blueCount++;
        }
      }
      
      if (i < 20) {
        samples.push({ x, y, r, g, b, a, isBlue: b > r + 30 });
      }
    }
    
    return {
      width,
      height,
      samples,
      blueCount,
      totalNonBackground,
      percentage: totalNonBackground > 0 ? (blueCount / totalNonBackground * 100).toFixed(1) : 0
    };
  });
  
  console.log('Canvas dimensions:', pixelData.width, 'x', pixelData.height);
  console.log('Blue pixel count:', pixelData.blueCount);
  console.log('Non-background pixels sampled:', pixelData.totalNonBackground);
  console.log('Blue percentage:', pixelData.percentage + '%');
  console.log('\nSample pixels (first 20):');
  pixelData.samples.forEach((p, i) => {
    console.log(`${i + 1}. (${p.x},${p.y}) RGB(${p.r}, ${p.g}, ${p.b}) ${p.isBlue ? '✓ BLUE' : ''}`);
  });
  
  await browser.close();
})();
