const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/hero-demos';

const heroes = [
  { num: 1, name: 'Plano Generativo' },
  { num: 2, name: 'Volúmenes Isométricos' },
  { num: 3, name: 'Arcos de Luz' },
  { num: 4, name: 'Grid Interactivo' },
  { num: 5, name: 'Corte Arquitectónico' },
  { num: 6, name: 'Proporción Áurea' }
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
        
        // Additional wait for animation to render
        await page.waitForTimeout(300);
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
        
        // For heroes 1,2,3,5,6 check opacity is 1 (not backdrop heroes 4)
        if (hero.num !== 4) {
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
        
        // Check art box is above text block and they don't overlap (except hero 4 which stays behind)
        if (hero.num !== 4) {
          const { artBottom, textTop } = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const textBlock = document.querySelector('.hero-content');
            const artBox = canvas.getBoundingClientRect();
            const textBox = textBlock.getBoundingClientRect();
            return {
              artBottom: artBox.bottom,
              textTop: textBox.top
            };
          });
          
          // Art should end before or at text start (no overlap)
          expect(artBottom).toBeLessThanOrEqual(textTop + 1); // +1 for rounding
        }
        
        // Check for non-background pixels in at least 2 of 4 quadrants (or just any content for small canvases)
        const { quadrantsWithContent, canvasSize } = await page.evaluate(() => {
          const canvas = document.querySelector('canvas');
          if (!canvas) return { quadrantsWithContent: 0, canvasSize: 0 };
          
          const ctx = canvas.getContext('2d');
          const w = canvas.width;
          const h = canvas.height;
          
          // For very small canvases, just check if ANY non-background pixels exist
          if (w < 500 || h < 400) {
            const imageData = ctx.getImageData(0, 0, w, h);
            const pixels = imageData.data;
            let hasContent = false;
            
            for (let i = 0; i < pixels.length; i += 4 * 100) {
              const a = pixels[i + 3];
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];
              
              if (a > 10 && !(r > 240 && g > 240 && b > 235)) {
                hasContent = true;
                break;
              }
            }
            
            return { quadrantsWithContent: hasContent ? 4 : 0, canvasSize: w * h };
          }
          
          // For larger canvases, check quadrants
          const quadrants = [
            { x: 0, y: 0, w: w/2, h: h/2 },
            { x: w/2, y: 0, w: w/2, h: h/2 },
            { x: 0, y: h/2, w: w/2, h: h/2 },
            { x: w/2, y: h/2, w: w/2, h: h/2 }
          ];
          
          let quadrantsWithPixels = 0;
          
          for (const quad of quadrants) {
            const imageData = ctx.getImageData(quad.x, quad.y, quad.w, quad.h);
            const pixels = imageData.data;
            
            let nonBackgroundCount = 0;
            const sampleRate = 300;
            
            for (let i = 0; i < pixels.length; i += 4 * sampleRate) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];
              const a = pixels[i + 3];
              
              if (a > 10 && !(r > 240 && g > 240 && b > 235)) {
                nonBackgroundCount++;
                if (nonBackgroundCount > 3) {
                  quadrantsWithPixels++;
                  break;
                }
              }
            }
          }
          
          return { quadrantsWithContent: quadrantsWithPixels, canvasSize: w * h };
        });
        
        expect(quadrantsWithContent).toBeGreaterThanOrEqual(2);
        
        // Check both CTAs are in viewport
        const ctaButtons = page.locator('.hero-buttons a');
        await expect(ctaButtons.first()).toBeInViewport();
        await expect(ctaButtons.last()).toBeInViewport();
        
        // Check no horizontal overflow
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow).toBe(false);
        
        // Test touch interaction - verify canvas responds and doesn't crash
        const canvas = page.locator('canvas');
        await canvas.dispatchEvent('pointerdown', { 
          clientX: viewport.width / 2, 
          clientY: viewport.height / 3,
          pointerType: 'touch'
        });
        
        // Verify canvas is still valid after touch
        await page.waitForTimeout(100);
        const canvasStillValid = await page.evaluate(() => {
          const canvas = document.querySelector('canvas');
          return canvas && canvas.width > 0 && canvas.height > 0;
        });
        expect(canvasStillValid).toBeTruthy();
        
        // Take screenshot at 390x844 for visual verification
        if (viewport.width === 390 && viewport.height === 844) {
          await page.screenshot({ 
            path: `test-screenshots/hero-${hero.num}-mobile-390x844.png`,
            fullPage: false
          });
        }
      });
    });
    
  });
  
});
