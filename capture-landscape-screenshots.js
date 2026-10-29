const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');

(async () => {
  const browser = await chromium.launch();
  
  // Desktop screenshot - 1280x800
  console.log('Capturing desktop screenshot (1280x800)...');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewportSize({ width: 1280, height: 800 });
  await desktopPage.goto(BASE_URL);
  
  // Wait for canvas and rendering
  await desktopPage.waitForSelector('canvas', { timeout: 5000 });
  await desktopPage.waitForTimeout(3000); // Wait 3s for settle
  
  await desktopPage.screenshot({
    path: path.join(SCREENSHOT_DIR, 'landscape-desktop-1280x800.png'),
    fullPage: false
  });
  console.log('Desktop screenshot saved.');
  
  // Mobile screenshot - 390x844
  console.log('Capturing mobile screenshot (390x844)...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewportSize({ width: 390, height: 844 });
  await mobilePage.goto(BASE_URL);
  
  // Wait for canvas and rendering
  await mobilePage.waitForSelector('canvas', { timeout: 5000 });
  await mobilePage.waitForTimeout(3000); // Wait 3s for settle
  
  await mobilePage.screenshot({
    path: path.join(SCREENSHOT_DIR, 'landscape-mobile-390x844.png'),
    fullPage: false
  });
  console.log('Mobile screenshot saved.');
  
  await browser.close();
  console.log('Screenshots captured successfully.');
})();
