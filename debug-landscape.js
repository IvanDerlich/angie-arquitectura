const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(3000);
  
  const canvasExists = await page.locator('canvas').count();
  console.log('Canvas count:', canvasExists);
  
  const hasWebGL = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 'no canvas';
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    return gl ? 'has WebGL' : 'no WebGL context';
  });
  console.log('WebGL:', hasWebGL);
  
  await browser.close();
})();
