const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://ivanderlich.github.io/angie-arquitectura';

test('diagnose quick-view modal bug', async ({ page }) => {
  const consoleMessages = [];
  const consoleErrors = [];
  
  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });
  
  // Visit with cache busting
  await page.goto(`${BASE_URL}?cache=${Date.now()}`);
  await page.waitForLoadState('networkidle');
  
  console.log('\n=== CLICKING FIRST CARD (Baño) ===\n');
  
  // Click first card in Obras
  const firstCard = page.locator('#obras .project-card').first();
  await firstCard.scrollIntoViewIfNeeded();
  await firstCard.click();
  
  // Wait a moment for modal to appear
  await page.waitForTimeout(500);
  
  // Take screenshot
  await page.screenshot({ path: '/workspace/diagnostic-modal.png', fullPage: false });
  console.log('Screenshot saved to diagnostic-modal.png');
  
  // Check if modal is present
  const quickView = page.locator('#quick-view');
  const hasHiddenAttr = await quickView.evaluate(el => el.hasAttribute('hidden'));
  console.log('\nModal hidden attribute:', hasHiddenAttr);
  
  // Get modal DOM
  const modalHTML = await quickView.evaluate(el => {
    const clone = el.cloneNode(true);
    // Truncate if too long
    const html = clone.outerHTML;
    return html.length > 2000 ? html.substring(0, 2000) + '...[truncated]' : html;
  });
  console.log('\nModal DOM:\n', modalHTML);
  
  // Get computed styles of main elements
  const overlayStyles = await page.locator('.quick-view-overlay').evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      display: computed.display,
      opacity: computed.opacity,
      visibility: computed.visibility,
      zIndex: computed.zIndex,
      position: computed.position,
      width: computed.width,
      height: computed.height,
      backgroundColor: computed.backgroundColor
    };
  });
  console.log('\nOverlay computed styles:', overlayStyles);
  
  const contentStyles = await page.locator('.quick-view-content').evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      display: computed.display,
      opacity: computed.opacity,
      visibility: computed.visibility,
      zIndex: computed.zIndex,
      position: computed.position,
      width: computed.width,
      height: computed.height,
      transform: computed.transform
    };
  });
  console.log('\nContent computed styles:', contentStyles);
  
  // Check image
  const imageSrc = await page.locator('.quick-view-image').getAttribute('src');
  console.log('\nImage src:', imageSrc);
  
  const imageData = await page.locator('.quick-view-image').evaluate(el => {
    return {
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      width: el.width,
      height: el.height,
      complete: el.complete
    };
  });
  console.log('Image data:', imageData);
  
  // Check if image is visible in viewport
  const imageBox = await page.locator('.quick-view-image').boundingBox();
  console.log('Image bounding box:', imageBox);
  
  // Check title text
  const titleText = await page.locator('.quick-view-title').textContent();
  console.log('\nTitle text:', titleText);
  
  // Check category text
  const categoryText = await page.locator('.quick-view-category').textContent();
  console.log('Category text:', categoryText);
  
  // Check description text
  const descriptionText = await page.locator('.quick-view-description').textContent();
  console.log('Description text:', descriptionText);
  
  // Check button
  const buttonVisible = await page.locator('.quick-view-full').isVisible();
  console.log('\nButton visible:', buttonVisible);
  
  // Console errors
  console.log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(err => console.log('ERROR:', err));
  } else {
    console.log('No console errors');
  }
  
  // All console messages
  console.log('\n=== ALL CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => {
    if (msg.type !== 'log') {
      console.log(`[${msg.type}]`, msg.text);
    }
  });
});
