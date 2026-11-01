const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8080';

test.describe('Real Content Verification', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('hero subtitle shows real content from Angie', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const heroTagline = page.locator('.hero-tagline');
        await expect(heroTagline).toContainText('Arquitectura consciente: te escucho y creo un espacio que hable de vos, refleje tu esencia y nutra tu espíritu.');
        
        // Should not contain placeholder text
        await expect(heroTagline).not.toContainText('[TAGLINE — REEMPLAZAR]');
        await expect(heroTagline).not.toContainText('REEMPLAZAR');
    });

    test('Sobre mí mentions Universidad de Mendoza (UM)', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#sobre-mi').scrollIntoViewIfNeeded();
        
        const sobreMiText = page.locator('.sobre-mi-text');
        await expect(sobreMiText).toContainText('Universidad de Mendoza (UM)');
        
        // Should not mention graduation year
        await expect(sobreMiText).not.toContainText(/\d{4}/);
    });

    test('Presupuesto section has WhatsApp CTA and no prices', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#precios').scrollIntoViewIfNeeded();
        
        // Should have WhatsApp button
        const whatsappBtn = page.locator('#precios a[href*="wa.me"]');
        await expect(whatsappBtn).toBeVisible();
        await expect(whatsappBtn).toContainText('Consultame por WhatsApp');
        
        // Should not contain price-related invented text
        const preciosSection = page.locator('#precios');
        await expect(preciosSection).not.toContainText('$');
        await expect(preciosSection).not.toContainText('precio');
        await expect(preciosSection).not.toContainText(/\d+%/);
    });

    test('Contacto section has correct email and Instagram', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#contacto').scrollIntoViewIfNeeded();
        
        const contactoSection = page.locator('#contacto');
        
        // Check email
        const emailLink = contactoSection.locator('a[href="mailto:arquitecturangeles@gmail.com"]');
        await expect(emailLink).toBeVisible();
        await expect(emailLink).toContainText('arquitecturangeles@gmail.com');
        
        // Check Instagram
        const instagramLink = contactoSection.locator('a[href="https://www.instagram.com/arquitecturangeles"]');
        await expect(instagramLink).toBeVisible();
        await expect(instagramLink).toContainText('@arquitecturangeles');
        
        // Instagram link should not have tracking params
        const instagramHref = await instagramLink.getAttribute('href');
        expect(instagramHref).not.toContain('?');
        expect(instagramHref).not.toContain('utm_');
    });

    test('bathroom project has correct activities', async ({ page }) => {
        await page.goto(`${BASE_URL}#/obra/bano`);
        
        const projectView = page.locator('#project-view');
        await expect(projectView).not.toHaveAttribute('hidden');
        
        // Check for specific activities
        const activitiesSection = projectView.locator('.project-activities');
        await expect(activitiesSection).toBeVisible();
        
        // Check for "Reorganización del espacio" activity
        await expect(activitiesSection).toContainText('Reorganización del espacio');
        await expect(activitiesSection).toContainText('Zonificación del espacio: de unificado tradicional a sectorizado por diferentes usos');
        
        // Check for "Diseño de mobiliario" activity
        await expect(activitiesSection).toContainText('Diseño de mobiliario');
        await expect(activitiesSection).toContainText('Diseño compositivo y materialidad a usar');
        await expect(activitiesSection).toContainText('grifería');
        
        // Check that "Dirección de obra" placeholder is visible
        await expect(activitiesSection).toContainText('Dirección de obra');
        await expect(activitiesSection).toContainText('[DIRECCIÓN DE OBRA — TEXTO DE ANGIE PENDIENTE]');
        
        // Check that "Cómputo de materiales" placeholder is visible
        await expect(activitiesSection).toContainText('Cómputo de materiales');
        await expect(activitiesSection).toContainText('[CÓMPUTO DE MATERIALES — TEXTO DE ANGIE PENDIENTE]');
    });

    test('Casa Country project is marked as "en obra"', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#obras').scrollIntoViewIfNeeded();
        
        const casaCountryCard = page.locator('.project-card[data-slug="casa-country"]');
        await expect(casaCountryCard).toBeVisible();
        
        // Should show "En obra" status
        await expect(casaCountryCard).toContainText('En obra');
        
        // Should not imply it's finished
        await expect(casaCountryCard).not.toContainText('terminada');
        await expect(casaCountryCard).not.toContainText('finalizada');
        await expect(casaCountryCard).not.toContainText('completada');
    });

    test('no invented presupuesto copy remains', async ({ page }) => {
        await page.goto(BASE_URL);
        
        // Check the whole page content
        const bodyText = await page.locator('body').textContent();
        
        // Should not contain invented pricing-related text patterns
        expect(bodyText).not.toContain('te mando una cotización');
        expect(bodyText).not.toContain('te envío un presupuesto detallado');
        expect(bodyText).not.toContain('honorarios profesionales');
        expect(bodyText).not.toContain('etapas del presupuesto');
        expect(bodyText).not.toContain('cómo se calcula');
    });

    test('all visible placeholders are marked with brackets', async ({ page }) => {
        await page.goto(BASE_URL);
        
        // Get all text content
        const bodyText = await page.locator('body').textContent();
        
        // If there's any "REEMPLAZAR" text, it should be in brackets
        const replacementMatches = bodyText.match(/REEMPLAZAR/g) || [];
        const bracketedMatches = bodyText.match(/\[.*?REEMPLAZAR.*?\]/g) || [];
        
        // Every REEMPLAZAR should be bracketed
        if (replacementMatches.length > 0) {
            expect(replacementMatches.length).toBe(bracketedMatches.length);
        }
    });

    test('footer has correct contact information', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const footer = page.locator('footer');
        
        // Check email in footer
        await expect(footer.locator('a[href="mailto:arquitecturangeles@gmail.com"]')).toBeVisible();
        
        // Check Instagram in footer
        await expect(footer.locator('a[href*="instagram.com/arquitecturangeles"]')).toBeVisible();
    });
});
