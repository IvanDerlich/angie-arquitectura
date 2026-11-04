const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  
  const branchName = process.env.BRANCH_NAME || 'hero';
  await page.screenshot({ path: `test-artifacts/${branchName}-1440x900.png` });
  
  await browser.close();
  console.log(`Screenshot saved to test-artifacts/${branchName}-1440x900.png`);
})();
