const { test } = require('@playwright/test');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test('inspect Proyectos images for captions', async ({ page }) => {
  await page.goto(BASE_URL);
  
  // Get all proyecto cards
  const proyectoCards = await page.locator('#proyectos .project-card').all();
  
  console.log('\n=== PROYECTOS SECTION IMAGE INSPECTION ===\n');
  
  for (let i = 0; i < proyectoCards.length; i++) {
    const card = proyectoCards[i];
    const title = await card.locator('.project-title').textContent();
    const imgSrc = await card.locator('.project-image-wrapper img').getAttribute('src');
    
    console.log(`\n${i + 1}. ${title}`);
    console.log(`   Card image: ${imgSrc}`);
    
    // Get all gallery images from data-gallery
    const galleryData = await card.getAttribute('data-gallery');
    if (galleryData) {
      const gallery = JSON.parse(galleryData);
      console.log(`   Gallery images: ${gallery.filter(g => g.endsWith('.jpg')).join(', ')}`);
      
      // Check for suspicious filenames
      const suspiciousPatterns = /antes|despues|portada|poster|caption|label/i;
      const suspicious = gallery.filter(g => suspiciousPatterns.test(g));
      if (suspicious.length > 0) {
        console.log(`   ⚠️  SUSPICIOUS (may have text): ${suspicious.join(', ')}`);
      }
    }
    
    // Take a screenshot of the card
    await card.screenshot({ 
      path: `test-artifacts/proyecto-${i + 1}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png` 
    });
  }
  
  console.log('\n=== END INSPECTION ===\n');
  console.log('Screenshots saved to test-artifacts/ directory');
});
