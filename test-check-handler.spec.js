const { test } = require('@playwright/test');

test('check if overlay has click handler', async ({ page }) => {
  await page.goto('https://ivanderlich.github.io/angie-arquitectura?t=' + Date.now());
  await page.waitForLoadState('networkidle');

  // Check if the quick-view IIFE found the overlay
  const hasHandler = await page.evaluate(() => {
    const quickView = document.getElementById('quick-view');
    if (!quickView) return 'quick-view not found';
    
    const overlay = quickView.querySelector('.quick-view-overlay');
    if (!overlay) return 'overlay not found';
    
    // Try to get the event listeners (not directly accessible, so we'll test by dispatching)
    return 'overlay exists';
  });
  console.log('Handler check:', hasHandler);

  // Open modal
  await page.locator('#obras .project-card').first().click();
  await page.waitForTimeout(500);

  // Try programmatic click
  const result = await page.evaluate(() => {
    const overlay = document.querySelector('.quick-view-overlay');
    if (!overlay) return 'overlay not found after open';
    
    // Dispatch a proper click event
    overlay.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    }));
    
    return 'dispatched click';
  });
  console.log('Click result:', result);

  await page.waitForTimeout(500);

  const isHidden = await page.evaluate(() => {
    return document.getElementById('quick-view').hasAttribute('hidden');
  });
  console.log('Modal hidden after programmatic click:', isHidden);
});
