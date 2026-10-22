const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const heroes = ['hero-1', 'hero-2', 'hero-3', 'hero-4', 'hero-5', 'hero-6'];
  
  const context = await browser.newContext({
    viewport: { width: 600, height: 400 }
  });

  for (const hero of heroes) {
    const page = await context.newPage();
    const filePath = path.join(__dirname, 'hero-demos', `${hero}.html`);
    await page.goto(`file://${filePath}`);
    await page.waitForTimeout(3500);
    
    const screenshotPath = path.join(__dirname, 'hero-demos', `${hero}-thumb.jpg`);
    await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 85 });
    console.log(`✓ ${hero} thumbnail`);
    await page.close();
  }

  await context.close();
  await browser.close();
  console.log('\n✓ All thumbnails created');
})();
