const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/hero-demos';

const heroes = [
  { num: 1, name: 'Plano Generativo', hasBackdrop: false },
  { num: 2, name: 'Volúmenes Isométricos', hasBackdrop: false },
  { num: 3, name: 'Arcos de Luz', hasBackdrop: false },
  { num: 4, name: 'Grid Interactivo', hasBackdrop: true },
  { num: 5, name: 'Corte Arquitectónico', hasBackdrop: false },
  { num: 6, name: 'Proporción Áurea', hasBackdrop: true }
];

test.describe('Hero Demos - Mobile Tests', () => {
  
  [
    { width: 390, height: 844, name: 'iPhone 12' },
    { width: 360, height: 780, name: 'Android Medium' }
  ].forEach(viewport => {
    
    heroes.forEach(hero => {
      test(`Hero ${hero.num} (${hero.name}) mobile at ${viewport.width}x${viewport.height}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${BASE_URL}/hero-${hero.num}.html`);
        
        // Wait for canvas to be ready
        await page.waitForFunction(() => {
          const c = document.querySelector('canvas');
          return c && c.width > 0 && c.height > 0;
        }, { timeout: 5000 });
        
        // Additional frame wait for rendering
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        
        // Check art canvas/wrapper height >= 40% viewport height
        const artHeight = await page.evaluate(() => {
          const canvas = document.querySelector('canvas');
          const wrapper = canvas?.closest('.art-wrapper') || canvas?.parentElement;
          const target = wrapper && wrapper.classList.contains('art-wrapper') ? wrapper : canvas;
          return target ? target.getBoundingClientRect().height : 0;
        });
        
        const minHeight = viewport.height * 0.40;
        expect(artHeight).toBeGreaterThanOrEqual(minHeight);
        
        // For heroes 1,2,3,5 check opacity is 1 (not backdrop heroes)
        if (!hero.hasBackdrop) {
          const artOpacity = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const wrapper = canvas?.closest('.art-wrapper');
            if (wrapper) {
              return parseFloat(window.getComputedStyle(wrapper).opacity);
            }
            return parseFloat(window.getComputedStyle(canvas).opacity);
          });
          expect(artOpacity).toBe(1);
        }
        
        // Check for non-background pixels in art box
        const hasContent = await page.evaluate(() => {
          const canvas = document.querySelector('canvas');
          if (!canvas) return false;
          
          const ctx = canvas.getContext('2d');
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          
          // Sample pixels to find non-transparent and non-pure-background
          let nonBackgroundCount = 0;
          const sampleRate = 100; // Check every 100th pixel
          
          for (let i = 0; i < pixels.length; i += 4 * sampleRate) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];
            
            // Check for non-transparent and not pure white/beige
            if (a > 10 && !(r > 240 && g > 240 && b > 235)) {
              nonBackgroundCount++;
              if (nonBackgroundCount > 10) return true; // Found enough content
            }
          }
          
          return nonBackgroundCount > 10;
        });
        
        expect(hasContent).toBeTruthy();
        
        // Check both CTAs are in viewport
        const ctaButtons = page.locator('.hero-buttons a');
        await expect(ctaButtons.first()).toBeInViewport();
        await expect(ctaButtons.last()).toBeInViewport();
        
        // Check no horizontal overflow
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow).toBe(false);
        
        // Test touch interaction
        const canvas = page.locator('canvas');
        await canvas.dispatchEvent('pointerdown', { 
          clientX: viewport.width / 2, 
          clientY: viewport.height / 3,
          pointerType: 'touch'
        });
        
        // Verify canvas still renders after touch
        await page.waitForTimeout(200);
        const stillHasContent = await page.evaluate(() => {
          const canvas = document.querySelector('canvas');
          if (!canvas) return false;
          const ctx = canvas.getContext('2d');
          
          // Sample multiple points across the canvas
          const samples = [
            {x: 0.5, y: 0.5}, // center
            {x: 0.3, y: 0.3}, // top-left quadrant
            {x: 0.7, y: 0.3}, // top-right quadrant
            {x: 0.3, y: 0.7}, // bottom-left quadrant
            {x: 0.7, y: 0.7}, // bottom-right quadrant
            {x: 0.5, y: 0.3}, // top-center
            {x: 0.5, y: 0.7}, // bottom-center
          ];
          
          for (const sample of samples) {
            const x = Math.floor(canvas.width * sample.x);
            const y = Math.floor(canvas.height * sample.y);
            if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
              const imageData = ctx.getImageData(x, y, 1, 1);
              if (imageData.data[3] > 0) return true;
            }
          }
          return false;
        });
        expect(stillHasContent).toBeTruthy();
      });
    });
    
  });
  
});
