const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://ivanderlich.github.io/angie-arquitectura/';

const projects = [
    { slug: 'fachada-01', title: 'Rediseño de fachada 01' },
    { slug: 'fachada-02', title: 'Rediseño de fachada 02' },
    { slug: 'fachada-03', title: 'Rediseño de fachada 03' },
    { slug: 'dormitorios', title: 'Diseño de dormitorios' },
    { slug: 'bano', title: 'Transformación de baño' },
    { slug: 'cocina', title: 'Amoblamiento de cocina' }
];

test.describe('Ángeles Arquitectura - Desktop', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('homepage loads correctly', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page).toHaveTitle(/Ángeles Arquitectura/);
        
        // Check main sections exist
        await expect(page.locator('#hero')).toBeVisible();
        await expect(page.locator('#obras')).toBeVisible();
        await expect(page.locator('#sobre-mi')).toBeVisible();
    });

    test('card hover shows zoom effect', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#obras').scrollIntoViewIfNeeded();
        
        const firstCard = page.locator('.project-card').first();
        const image = firstCard.locator('.project-image-wrapper img');
        
        // Check cursor is zoom-in
        await expect(firstCard.locator('.project-image-wrapper')).toHaveCSS('cursor', 'zoom-in');
        
        // Hover should trigger scale transform
        await firstCard.hover();
        await page.waitForTimeout(500); // Wait for transition
    });

    for (const project of projects) {
        test(`quick-view opens for ${project.title}`, async ({ page }) => {
            await page.goto(BASE_URL);
            await page.locator('#obras').scrollIntoViewIfNeeded();
            
            // Click the card
            await page.locator(`.project-card[data-slug="${project.slug}"]`).click();
            
            // Quick view should be visible
            const quickView = page.locator('#quick-view');
            await expect(quickView).not.toHaveAttribute('hidden');
            
            // Check content
            await expect(quickView.locator('.quick-view-title')).toContainText(project.title);
            await expect(quickView.locator('.quick-view-image')).toBeVisible();
            await expect(quickView.locator('.quick-view-full')).toContainText('Ver proyecto completo');
            
            // Close with Esc
            await page.keyboard.press('Escape');
            await expect(quickView).toHaveAttribute('hidden');
        });

        test(`navigates to full project page for ${project.slug}`, async ({ page }) => {
            await page.goto(BASE_URL);
            await page.locator('#obras').scrollIntoViewIfNeeded();
            
            // Click card to open quick-view
            await page.locator(`.project-card[data-slug="${project.slug}"]`).click();
            
            // Click "Ver proyecto completo"
            await page.locator('.quick-view-full').click();
            
            // Should navigate to project page
            await expect(page).toHaveURL(`${BASE_URL}#/obra/${project.slug}`);
            await expect(page).toHaveTitle(new RegExp(project.title));
            
            // Project page should be visible
            const projectView = page.locator('#project-view');
            await expect(projectView).not.toHaveAttribute('hidden');
            await expect(projectView.locator('.project-page-title')).toContainText(project.title);
            
            // Gallery should exist
            await expect(projectView.locator('.project-gallery')).toBeVisible();
            
            // Main sections should be hidden
            await expect(page.locator('header')).toHaveAttribute('hidden');
            await expect(page.locator('#obras')).toHaveAttribute('hidden');
        });

        test(`deep link works for ${project.slug}`, async ({ page }) => {
            // Navigate directly to project page
            await page.goto(`${BASE_URL}#/obra/${project.slug}`);
            
            // Project page should load
            await expect(page).toHaveTitle(new RegExp(project.title));
            const projectView = page.locator('#project-view');
            await expect(projectView).not.toHaveAttribute('hidden');
            await expect(projectView.locator('.project-page-title')).toContainText(project.title);
        });
    }

    test('browser back button works', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#obras').scrollIntoViewIfNeeded();
        
        // Go to a project
        await page.locator('.project-card[data-slug="fachada-02"]').click();
        await page.locator('.quick-view-full').click();
        await expect(page).toHaveURL(/\/obra\/fachada-02/);
        
        // Go back
        await page.goBack();
        await expect(page).toHaveURL(BASE_URL);
        await expect(page.locator('header')).not.toHaveAttribute('hidden');
        await expect(page.locator('#obras')).toBeVisible();
    });

    test('volver a obras link works', async ({ page }) => {
        await page.goto(`${BASE_URL}#/obra/cocina`);
        
        // Click back link
        await page.locator('.project-back').click();
        await expect(page).toHaveURL(`${BASE_URL}#obras`);
        await expect(page.locator('#obras')).toBeVisible();
    });

    test('lightbox opens from project gallery', async ({ page }) => {
        await page.goto(`${BASE_URL}#/obra/fachada-03`);
        
        // Click first gallery item
        await page.locator('.gallery-item').first().click();
        
        // Lightbox should open
        const lightbox = page.locator('#lightbox');
        await expect(lightbox).not.toHaveAttribute('hidden');
        await expect(lightbox.locator('.lightbox-stage img, .lightbox-stage video')).toBeVisible();
        
        // Close with Esc
        await page.keyboard.press('Escape');
        await expect(lightbox).toHaveAttribute('hidden');
    });

    test('Angie photo appears only in correct sections', async ({ page }) => {
        await page.goto(BASE_URL);
        
        // Check hero card has photo
        const heroCardImg = page.locator('.hero-card-img[src="assets/angie-foto.png"]');
        await expect(heroCardImg).toBeVisible();
        
        // Check Sobre mí has photo
        await page.locator('#sobre-mi').scrollIntoViewIfNeeded();
        const sobreMiImg = page.locator('.sobre-mi-image[src="assets/angie-foto.png"]');
        await expect(sobreMiImg).toBeVisible();
        
        // Check contact section does NOT have photo
        await page.locator('#contacto').scrollIntoViewIfNeeded();
        const contactImg = page.locator('.contacto-image img[src="assets/angie-foto.png"]');
        await expect(contactImg).toHaveCount(0);
    });
});

test.describe('Ángeles Arquitectura - Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('mobile homepage loads correctly', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page).toHaveTitle(/Ángeles Arquitectura/);
        await expect(page.locator('#hero')).toBeVisible();
    });

    test('mobile quick-view works', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#obras').scrollIntoViewIfNeeded();
        
        await page.locator('.project-card[data-slug="bano"]').click();
        
        const quickView = page.locator('#quick-view');
        await expect(quickView).not.toHaveAttribute('hidden');
        await expect(quickView.locator('.quick-view-title')).toBeVisible();
    });

    test('mobile project page works', async ({ page }) => {
        await page.goto(`${BASE_URL}#/obra/cocina`);
        
        const projectView = page.locator('#project-view');
        await expect(projectView).not.toHaveAttribute('hidden');
        await expect(projectView.locator('.project-page-title')).toBeVisible();
        await expect(projectView.locator('.project-gallery')).toBeVisible();
    });

    test('mobile lightbox works', async ({ page }) => {
        await page.goto(`${BASE_URL}#/obra/dormitorios`);
        
        await page.locator('.gallery-item').first().click();
        
        const lightbox = page.locator('#lightbox');
        await expect(lightbox).not.toHaveAttribute('hidden');
        
        await page.keyboard.press('Escape');
        await expect(lightbox).toHaveAttribute('hidden');
    });
});

test.describe('Cover Images Quality', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('all cover images load without 404', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#obras').scrollIntoViewIfNeeded();
        
        const coverImages = [
            'assets/obras/fachada1.jpg',
            'assets/obras/fachada2.jpg',
            'assets/obras/fachada3-b.jpg',
            'assets/obras/dormitorio-2.jpg',
            'assets/obras/bano-3.jpg',
            'assets/obras/cocina-2.jpg'
        ];
        
        for (const src of coverImages) {
            const response = await page.goto(`${BASE_URL}${src}`);
            expect(response?.status()).toBe(200);
        }
    });
});
