const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://ivanderlich.github.io/angie-arquitectura/';

test.describe('Ángeles Arquitectura - Simplified', () => {
    test('desktop - card click opens lightbox', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(BASE_URL);
        
        // Wait for page to load
        await page.locator('#obras').scrollIntoViewIfNeeded();
        
        // Click first project card
        await page.locator('.project-card').first().click();
        
        // Lightbox should open
        const lightbox = page.locator('#lightbox');
        await expect(lightbox).not.toHaveAttribute('hidden');
        await expect(lightbox.locator('.lightbox-stage img, .lightbox-stage video')).toBeVisible();
        
        // Close with Esc
        await page.keyboard.press('Escape');
        await expect(lightbox).toHaveAttribute('hidden');
    });

    test('mobile - card click opens lightbox', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(BASE_URL);
        
        await page.locator('#obras').scrollIntoViewIfNeeded();
        await page.locator('.project-card').first().click();
        
        const lightbox = page.locator('#lightbox');
        await expect(lightbox).not.toHaveAttribute('hidden');
    });

    test('no placeholder text appears', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const bodyText = await page.locator('body').textContent();
        
        // Check for no REEMPLAZAR text
        expect(bodyText).not.toMatch(/REEMPLAZAR/i);
        
        // Check for no visible bracket placeholders (ignoring data attributes)
        const visibleText = await page.evaluate(() => {
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null
            );
            let text = '';
            let node;
            while (node = walker.nextNode()) {
                text += node.textContent;
            }
            return text;
        });
        
        expect(visibleText).not.toMatch(/\[.*REEMPLAZAR.*\]/);
        expect(visibleText).not.toMatch(/\[UBICACIÓN/);
        expect(visibleText).not.toMatch(/\[DESCRIPCIÓN/);
    });

    test('all project cards have clean covers', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#obras').scrollIntoViewIfNeeded();
        
        const cards = page.locator('.project-card');
        const count = await cards.count();
        
        expect(count).toBe(6);
        
        // Check each card has an image
        for (let i = 0; i < count; i++) {
            const img = cards.nth(i).locator('.project-image-wrapper img');
            await expect(img).toBeVisible();
        }
    });

    test('lightbox navigation works', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#obras').scrollIntoViewIfNeeded();
        
        // Click a project with multiple images (fachada-03)
        await page.locator('.project-card').nth(2).click();
        
        const lightbox = page.locator('#lightbox');
        await expect(lightbox).not.toHaveAttribute('hidden');
        
        // Check for prev/next buttons
        const nextBtn = lightbox.locator('.lightbox-next');
        await expect(nextBtn).toBeVisible();
        
        // Click next
        await nextBtn.click();
        await page.waitForTimeout(300);
        
        // Should still be open
        await expect(lightbox).not.toHaveAttribute('hidden');
        
        // Close
        await page.keyboard.press('Escape');
        await expect(lightbox).toHaveAttribute('hidden');
    });

    test('card hover shows zoom effect', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#obras').scrollIntoViewIfNeeded();
        
        const card = page.locator('.project-card').first();
        const imageWrapper = card.locator('.project-image-wrapper');
        
        // Check cursor style
        const cursor = await imageWrapper.evaluate(el => 
            window.getComputedStyle(el).cursor
        );
        expect(cursor).toBe('zoom-in');
    });
});
