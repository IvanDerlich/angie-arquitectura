const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  const variants = [
    { name: 'unwoven', path: '/staging-heroes/unwoven/' },
    { name: 'landscape', path: '/staging-heroes/landscape/' },
    { name: 'exhibition', path: '/staging-heroes/exhibition/' },
    { name: 'room', path: '/staging-heroes/room/' }
  ];

  const sizes = [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'mobile', width: 390, height: 844 }
  ];

  for (const variant of variants) {
    for (const size of sizes) {
      const page = await context.newPage();
      await page.setViewportSize({ width: size.width, height: size.height });
      
      console.log(`Capturing ${variant.name} at ${size.name} (${size.width}x${size.height})`);
      
      await page.goto(`http://localhost:8080${variant.path}`);
      await page.waitForTimeout(3000); // Wait for rendering
      
      await page.screenshot({
        path: `staging-heroes/_shots/${variant.name}-${size.name}-${size.width}x${size.height}.png`,
        fullPage: false
      });
      
      await page.close();
    }
  }

  await browser.close();
  console.log('Screenshots complete!');
})();
