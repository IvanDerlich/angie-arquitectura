const { test } = require('@playwright/test');

test('debug mobile overlay click', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://ivanderlich.github.io/angie-arquitectura?t=' + Date.now());
  await page.waitForLoadState('networkidle');

  // Click card
  await page.locator('#obras .project-card').first().click();
  await page.waitForTimeout(500);

  // Check overlay
  const overlayBox = await page.locator('.quick-view-overlay').boundingBox();
  console.log('Overlay box:', overlayBox);

  const isVisible = await page.locator('.quick-view-overlay').isVisible();
  console.log('Overlay visible:', isVisible);

  const pointerEvents = await page.locator('.quick-view-overlay').evaluate(el => {
    return window.getComputedStyle(el).pointerEvents;
  });
  console.log('Pointer events:', pointerEvents);

  const zIndex = await page.locator('.quick-view-overlay').evaluate(el => {
    return window.getComputedStyle(el).zIndex;
  });
  console.log('Z-index:', zIndex);

  // Try clicking with force
  await page.locator('.quick-view-overlay').click({ force: true, timeout: 5000 });
  console.log('Clicked overlay');

  await page.waitForTimeout(500);

  const hidden = await page.locator('#quick-view').evaluate(el => el.hasAttribute('hidden'));
  console.log('Modal hidden after click:', hidden);
});
