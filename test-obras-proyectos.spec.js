const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test.describe('Obras and Proyectos Sections', () => {
  test('should have both Obras and Proyectos in nav menu', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check desktop nav
    const navObras = page.locator('nav a[href="#obras"]');
    const navProyectos = page.locator('nav a[href="#proyectos"]');
    
    await expect(navObras).toBeVisible();
    await expect(navProyectos).toBeVisible();
    
    // Verify order (Obras before Proyectos)
    const navLinks = await page.locator('nav a').allTextContents();
    const obrasIndex = navLinks.indexOf('Obras');
    const proyectosIndex = navLinks.indexOf('Proyectos');
    
    expect(obrasIndex).toBeGreaterThanOrEqual(0);
    expect(proyectosIndex).toBeGreaterThanOrEqual(0);
    expect(obrasIndex).toBeLessThan(proyectosIndex);
  });

  test('should have Obras section with Baño and Casa Country', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await page.locator('#obras').scrollIntoViewIfNeeded();
    
    // Check section exists
    await expect(page.locator('#obras')).toBeVisible();
    
    // Count cards in Obras (should be 2: Baño + Casa Country)
    const obrasCards = page.locator('#obras .project-card');
    await expect(obrasCards).toHaveCount(2);
    
    // Verify Baño is present (featured first)
    await expect(obrasCards.first()).toContainText('Remodelación de sanitario');
    
    // Verify Casa Country is present (marked as En obra)
    await expect(obrasCards.nth(1)).toContainText('Casa Country');
    await expect(obrasCards.nth(1)).toContainText('En obra');
  });

  test('should have Proyectos section with 5 projects', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await page.locator('#proyectos').scrollIntoViewIfNeeded();
    
    // Check section exists
    await expect(page.locator('#proyectos')).toBeVisible();
    
    // Count cards in Proyectos (should be 5)
    const proyectosCards = page.locator('#proyectos .project-card');
    await expect(proyectosCards).toHaveCount(5);
    
    // Verify project titles
    await expect(proyectosCards.nth(0)).toContainText('Rediseño de fachada 01');
    await expect(proyectosCards.nth(1)).toContainText('Rediseño de fachada 02');
    await expect(proyectosCards.nth(2)).toContainText('Rediseño de fachada 03');
    await expect(proyectosCards.nth(3)).toContainText('Diseño de dormitorios');
    await expect(proyectosCards.nth(4)).toContainText('Amoblamiento de cocina');
  });

  test('should open quick-view modal on card click', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Click Baño card
    await page.locator('#obras .project-card').first().click();
    
    // Quick view should be visible
    const quickView = page.locator('#quick-view');
    await expect(quickView).toBeVisible();
    
    // Check content
    await expect(quickView.locator('.quick-view-title')).toContainText('Remodelación de sanitario');
    await expect(quickView.locator('.quick-view-category')).toContainText('Remodelación');
    
    // Close modal
    await page.locator('.quick-view-close').click();
    await expect(quickView).toBeHidden();
  });

  test('should navigate to Obra detail page from quick-view', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Click Baño card
    await page.locator('#obras .project-card').first().click();
    
    // Wait for quick view to be visible
    const quickView = page.locator('#quick-view');
    await expect(quickView).toBeVisible();
    
    // Click "Ver proyecto completo" and wait for navigation
    await page.locator('.quick-view-full').click();
    await page.waitForTimeout(500); // Wait for hash change
    
    // Should navigate to #/obra/bano
    await expect(page).toHaveURL(/.*#\/obra\/bano/);
    
    // Project view should be visible
    await expect(page.locator('#project-view')).toBeVisible();
    await expect(page.locator('.project-page-title')).toContainText('Remodelación de sanitario');
  });

  test('should navigate to Proyecto detail page from quick-view', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Click Cocina card
    await page.locator('#proyectos .project-card').last().click();
    
    // Wait for quick view to be visible
    const quickView = page.locator('#quick-view');
    await expect(quickView).toBeVisible();
    
    // Click "Ver proyecto completo" and wait for navigation
    await page.locator('.quick-view-full').click();
    await page.waitForTimeout(500); // Wait for hash change
    
    // Should navigate to #/proyecto/cocina
    await expect(page).toHaveURL(/.*#\/proyecto\/cocina/);
    
    // Project view should be visible
    await expect(page.locator('#project-view')).toBeVisible();
    await expect(page.locator('.project-page-title')).toContainText('Amoblamiento de cocina');
  });

  test('should show "Diseño → Resultado real" section for Baño', async ({ page }) => {
    await page.goto(`${BASE_URL}#/obra/bano`);
    
    // Wait for project view to load
    await expect(page.locator('.project-page-title')).toBeVisible();
    
    // Check for comparison section
    const comparisonSection = page.locator('.project-comparison-section');
    await expect(comparisonSection).toBeVisible();
    
    // Check section title
    await expect(comparisonSection.locator('.project-section-title')).toContainText('Diseño → Resultado real');
    
    // Check both columns
    await expect(comparisonSection.locator('.project-comparison-subtitle').nth(0)).toContainText('Renders del diseño');
    await expect(comparisonSection.locator('.project-comparison-subtitle').nth(1)).toContainText('Fotos del resultado');
    
    // Should have gallery items in both columns
    const designGallery = comparisonSection.locator('.project-comparison-column').nth(0).locator('.gallery-item');
    const realGallery = comparisonSection.locator('.project-comparison-column').nth(1).locator('.gallery-item');
    
    await expect(designGallery.first()).toBeVisible();
    await expect(realGallery.first()).toBeVisible();
  });

  test('should NOT show comparison section for render-only projects', async ({ page }) => {
    await page.goto(`${BASE_URL}#/proyecto/cocina`);
    
    // Wait for project view to load
    await expect(page.locator('.project-page-title')).toBeVisible();
    
    // Comparison section should NOT exist
    const comparisonSection = page.locator('.project-comparison-section');
    await expect(comparisonSection).toHaveCount(0);
  });

  test('should have back link with correct text for Obra', async ({ page }) => {
    await page.goto(`${BASE_URL}#/obra/bano`);
    
    // Wait for project view to load
    await expect(page.locator('.project-page-title')).toBeVisible();
    
    // Check back link
    const backLink = page.locator('.project-back-link a');
    await expect(backLink).toContainText('Volver a obras');
    await expect(backLink).toHaveAttribute('href', '#obras');
  });

  test('should have back link with correct text for Proyecto', async ({ page }) => {
    await page.goto(`${BASE_URL}#/proyecto/fachada-01`);
    
    // Wait for project view to load
    await expect(page.locator('.project-page-title')).toBeVisible();
    
    // Check back link
    const backLink = page.locator('.project-back-link a');
    await expect(backLink).toContainText('Volver a proyectos');
    await expect(backLink).toHaveAttribute('href', '#proyectos');
  });

  test('should open lightbox from gallery', async ({ page }) => {
    await page.goto(`${BASE_URL}#/obra/bano`);
    
    // Wait for project view to load
    await expect(page.locator('.project-page-title')).toBeVisible();
    await page.waitForTimeout(500); // Wait for gallery to render
    
    // Click first gallery item
    await page.locator('.project-gallery .gallery-item').first().click();
    
    // Lightbox should be visible
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toBeVisible();
    
    // Close lightbox
    await page.locator('.lightbox-close').click();
    await expect(lightbox).toBeHidden();
  });

  test('should preserve all placeholder brackets', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check for placeholder brackets in visible text
    const body = await page.locator('body').textContent();
    
    // Check for visible placeholders (description placeholders are in multiple cards)
    expect(body).toContain('[DESCRIPCIÓN DEL PROYECTO — REEMPLAZAR POR TEXTO DE ANGIE]');
    expect(body).toContain('[BIO — REEMPLAZAR POR TEXTO DE ANGIE]');
    // Email and Instagram are no longer placeholders
    
    // Verify Casa Country has location in data attribute (not displayed)
    const casaCountryCard = page.locator('#obras .project-card').nth(1);
    const locationData = await casaCountryCard.getAttribute('data-location');
    expect(locationData).toBe('[UBICACIÓN — A CONFIRMAR]');
  });

  test('should have correct section numbering', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check section labels
    await expect(page.locator('#obras .section-label')).toContainText('01');
    await expect(page.locator('#proyectos .section-label')).toContainText('02');
    await expect(page.locator('#actividades .section-label')).toContainText('03');
    await expect(page.locator('#sobre-mi .section-label')).toContainText('04');
    await expect(page.locator('#servicios .section-label')).toContainText('05');
    await expect(page.locator('.precios .section-label')).toContainText('06');
    await expect(page.locator('.contacto .section-label')).toContainText('07');
  });

  test('should show only ONE photo of Angie', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Count images with Angie's photo
    const angiePhotos = page.locator('img[src*="angie-foto.png"]');
    await expect(angiePhotos).toHaveCount(1);
    
    // Should be in Sobre mí section
    const sobreMiPhoto = page.locator('#sobre-mi img[src*="angie-foto.png"]');
    await expect(sobreMiPhoto).toBeVisible();
  });

  test('mobile: should show both sections in mobile nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    // Open mobile menu
    await page.locator('#mobile-menu-btn').click();
    
    // Check nav links
    const nav = page.locator('#nav');
    await expect(nav.locator('a[href="#obras"]')).toBeVisible();
    await expect(nav.locator('a[href="#proyectos"]')).toBeVisible();
  });

  test('deep link to obra should work', async ({ page }) => {
    await page.goto(`${BASE_URL}#/obra/bano`);
    
    // Should show project view directly
    await expect(page.locator('#project-view')).toBeVisible();
    await expect(page.locator('.project-page-title')).toContainText('Remodelación de sanitario');
  });

  test('deep link to proyecto should work', async ({ page }) => {
    await page.goto(`${BASE_URL}#/proyecto/dormitorios`);
    
    // Should show project view directly
    await expect(page.locator('#project-view')).toBeVisible();
    await expect(page.locator('.project-page-title')).toContainText('Diseño de dormitorios');
  });

  test('browser back should work from obra detail', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Navigate to obra
    await page.locator('#obras .project-card').first().click();
    await expect(page.locator('#quick-view')).toBeVisible();
    await page.locator('.quick-view-full').click();
    await page.waitForTimeout(500);
    
    // Should be on detail page
    await expect(page).toHaveURL(/.*#\/obra\/bano/);
    
    // Go back
    await page.goBack();
    await page.waitForTimeout(500);
    
    // Should be back on main site
    await expect(page.locator('#obras')).toBeVisible();
  });

  test('should not use captioned image filenames in Obras section', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Get all image src attributes in Obras section
    const imageSrcs = await page.locator('#obras img').evaluateAll(imgs => 
      imgs.map(img => img.getAttribute('src') || '')
    );
    
    // Check that no image filename matches the caption pattern
    const captionPattern = /fachada|antes|despues/i;
    const captionedImages = imageSrcs.filter(src => {
      const filename = src.split('/').pop() || '';
      return captionPattern.test(filename);
    });
    
    expect(captionedImages).toHaveLength(0);
  });

  test('should show bathroom activities', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await page.locator('#obras').scrollIntoViewIfNeeded();
    
    const banoCard = page.locator('#obras .project-card').first();
    
    // Check for activities text
    const activitiesText = await banoCard.locator('.project-activities').textContent();
    
    expect(activitiesText).toContain('Dirección de obra');
  });

  test('should show location for bathroom obra', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await page.locator('#obras').scrollIntoViewIfNeeded();
    
    const banoCard = page.locator('#obras .project-card').first();
    
    // Check that location is shown
    const cardText = await banoCard.textContent();
    expect(cardText).toContain('Ciudad de Mendoza');
  });

  test('mobile: images should be full-width and crisp at 390x844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);
    
    await page.locator('#obras').scrollIntoViewIfNeeded();
    
    // Check bathroom image wrapper width
    const banoImageWrapper = page.locator('#obras .project-card').first().locator('.project-image-wrapper');
    const imageWrapperWidth = await banoImageWrapper.evaluate(el => el.offsetWidth);
    
    // Should be at least 340px wide
    expect(imageWrapperWidth).toBeGreaterThanOrEqual(340);
    
    // Check that image fills the wrapper
    const banoImage = banoImageWrapper.locator('img');
    const imageWidth = await banoImage.evaluate(el => el.offsetWidth);
    
    expect(imageWidth).toBeGreaterThanOrEqual(340);
  });
});
