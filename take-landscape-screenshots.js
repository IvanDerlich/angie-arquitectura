const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  
  // Desktop screenshot
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktopPage.goto('http://localhost:8080/');
  await desktopPage.waitForSelector('canvas', { timeout: 5000 });
  await desktopPage.waitForTimeout(2000); // Wait for animation
  await desktopPage.screenshot({ path: 'test-screenshots/landscape-desktop-1280x800.png', fullPage: false });
  console.log('Desktop screenshot saved');
  await desktopPage.close();
  
  // Mobile screenshot
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:8080/');
  await mobilePage.waitForSelector('canvas', { timeout: 5000 });
  await mobilePage.waitForTimeout(2000); // Wait for animation
  await mobilePage.screenshot({ path: 'test-screenshots/landscape-mobile-390x844.png', fullPage: true });
  console.log('Mobile screenshot saved');
  await mobilePage.close();
  
  await browser.close();
  console.log('Screenshots complete!');
})();
