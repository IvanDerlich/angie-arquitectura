const { test } = require('@playwright/test');

test('verify video poster frames', async ({ page }) => {
  await page.goto('https://ivanderlich.github.io/angie-arquitectura?t=' + Date.now() + '#/obra/bano');
  await page.waitForLoadState('networkidle');
  
  // Wait for gallery to load
  await page.waitForTimeout(1000);
  
  // Find video in gallery
  const videoThumbnail = page.locator('.project-gallery video.gallery-thumbnail').first();
  
  // Check if poster attribute exists
  const poster = await videoThumbnail.getAttribute('poster');
  console.log('Video poster attribute:', poster);
  
  // Check if video element has loaded poster
  const hasValidPoster = await videoThumbnail.evaluate(video => {
    return video.poster && video.poster.length > 0;
  });
  console.log('Video has valid poster:', hasValidPoster);
  
  // Take screenshot
  await page.screenshot({ path: '/workspace/video-poster-test.png', fullPage: true });
  console.log('Screenshot saved to video-poster-test.png');
  
  // Click video to open lightbox
  const videoItem = page.locator('.project-gallery .gallery-item').filter({ has: page.locator('video') }).first();
  await videoItem.click();
  await page.waitForTimeout(500);
  
  // Check lightbox video has poster
  const lightboxVideo = page.locator('.lightbox-stage video');
  const lightboxPoster = await lightboxVideo.getAttribute('poster');
  console.log('Lightbox video poster:', lightboxPoster);
  
  // Screenshot lightbox
  await page.screenshot({ path: '/workspace/lightbox-video-test.png' });
  console.log('Screenshot saved to lightbox-video-test.png');
});
