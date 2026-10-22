const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://ivanderlich.github.io/angie-arquitectura';

// Create artifacts directory
const artifactsDir = '/workspace/test-artifacts';
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

const projects = {
  obras: [
    { slug: 'bano', name: 'Transformación de baño', index: 0 }
  ],
  proyectos: [
    { slug: 'fachada-01', name: 'Rediseño de fachada 01', index: 0 },
    { slug: 'fachada-02', name: 'Rediseño de fachada 02', index: 1 },
    { slug: 'fachada-03', name: 'Rediseño de fachada 03', index: 2 },
    { slug: 'dormitorios', name: 'Diseño de dormitorios', index: 3 },
    { slug: 'cocina', name: 'Amoblamiento de cocina', index: 4 }
  ]
};

test.describe('Quick-View Modal - Desktop 1280x800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const [section, items] of Object.entries(projects)) {
    for (const project of items) {
      test(`${section}/${project.slug} - quick-view modal`, async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        // Visit with cache busting
        await page.goto(`${BASE_URL}?t=${Date.now()}`);
        await page.waitForLoadState('networkidle');

        // Click the card
        const card = page.locator(`#${section} .project-card`).nth(project.index);
        await card.scrollIntoViewIfNeeded();
        await card.click();

        // Wait for modal
        await page.waitForTimeout(300);

        // Check modal is visible
        const modal = page.locator('#quick-view');
        await expect(modal).toBeVisible();

        // Check modal content is in viewport
        const contentBox = await page.locator('.quick-view-content').boundingBox();
        expect(contentBox).not.toBeNull();
        expect(contentBox.x).toBeGreaterThanOrEqual(0);
        expect(contentBox.y).toBeGreaterThanOrEqual(0);
        expect(contentBox.x + contentBox.width).toBeLessThanOrEqual(1280);
        expect(contentBox.y + contentBox.height).toBeLessThanOrEqual(800);

        // Check image loaded
        const image = page.locator('.quick-view-image');
        const naturalWidth = await image.evaluate(img => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);

        // Check image is visible in viewport
        const imageBox = await image.boundingBox();
        expect(imageBox).not.toBeNull();
        expect(imageBox.y).toBeGreaterThanOrEqual(0);
        expect(imageBox.y).toBeLessThanOrEqual(800);

        // Check title is visible
        await expect(page.locator('.quick-view-title')).toBeVisible();
        const titleText = await page.locator('.quick-view-title').textContent();
        expect(titleText.length).toBeGreaterThan(0);

        // Check button is visible
        await expect(page.locator('.quick-view-full')).toBeVisible();

        // Screenshot
        await page.screenshot({ 
          path: path.join(artifactsDir, `desktop-${section}-${project.slug}-quickview.png`),
          fullPage: false 
        });

        // No console errors
        expect(consoleErrors).toHaveLength(0);

        // Test close with X
        await page.locator('.quick-view-close').click();
        await expect(modal).toBeHidden();
      });

      test(`${section}/${project.slug} - project page`, async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        await page.goto(`${BASE_URL}?t=${Date.now()}`);
        await page.waitForLoadState('networkidle');

        // Click card
        const card = page.locator(`#${section} .project-card`).nth(project.index);
        await card.scrollIntoViewIfNeeded();
        await card.click();
        await page.waitForTimeout(300);

        // Click "Ver proyecto completo"
        await page.locator('.quick-view-full').click();
        await page.waitForTimeout(500);

        // Check URL
        const type = section === 'obras' ? 'obra' : 'proyecto';
        await expect(page).toHaveURL(new RegExp(`#/${type}/${project.slug}`));

        // Check project view is visible
        await expect(page.locator('#project-view')).toBeVisible();

        // Check title in viewport
        const titleBox = await page.locator('.project-page-title').boundingBox();
        expect(titleBox).not.toBeNull();
        expect(titleBox.y).toBeGreaterThanOrEqual(0);

        // Screenshot
        await page.screenshot({ 
          path: path.join(artifactsDir, `desktop-${section}-${project.slug}-project.png`),
          fullPage: true 
        });

        expect(consoleErrors).toHaveLength(0);
      });
    }
  }
});

test.describe('Quick-View Modal - Mobile 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const [section, items] of Object.entries(projects)) {
    for (const project of items) {
      test(`${section}/${project.slug} - quick-view modal`, async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        await page.goto(`${BASE_URL}?t=${Date.now()}`);
        await page.waitForLoadState('networkidle');

        const card = page.locator(`#${section} .project-card`).nth(project.index);
        await card.scrollIntoViewIfNeeded();
        await card.click();
        await page.waitForTimeout(300);

        const modal = page.locator('#quick-view');
        await expect(modal).toBeVisible();

        // Check modal content is in viewport
        const contentBox = await page.locator('.quick-view-content').boundingBox();
        expect(contentBox).not.toBeNull();
        expect(contentBox.x).toBeGreaterThanOrEqual(0);
        expect(contentBox.y).toBeGreaterThanOrEqual(0);
        expect(contentBox.x + contentBox.width).toBeLessThanOrEqual(390);

        // Check image loaded
        const naturalWidth = await page.locator('.quick-view-image').evaluate(img => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);

        // Check title visible
        await expect(page.locator('.quick-view-title')).toBeVisible();

        // Screenshot
        await page.screenshot({ 
          path: path.join(artifactsDir, `mobile-${section}-${project.slug}-quickview.png`),
          fullPage: false 
        });

        expect(consoleErrors).toHaveLength(0);

        // Test close with X button (more reliable on mobile)
        await page.locator('.quick-view-close').click();
        await expect(modal).toBeHidden();
      });

      test(`${section}/${project.slug} - project page`, async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        await page.goto(`${BASE_URL}?t=${Date.now()}`);
        await page.waitForLoadState('networkidle');

        const card = page.locator(`#${section} .project-card`).nth(project.index);
        await card.scrollIntoViewIfNeeded();
        await card.click();
        await page.waitForTimeout(300);

        await page.locator('.quick-view-full').click();
        await page.waitForTimeout(500);

        const type = section === 'obras' ? 'obra' : 'proyecto';
        await expect(page).toHaveURL(new RegExp(`#/${type}/${project.slug}`));
        await expect(page.locator('#project-view')).toBeVisible();

        // Screenshot
        await page.screenshot({ 
          path: path.join(artifactsDir, `mobile-${section}-${project.slug}-project.png`),
          fullPage: true 
        });

        expect(consoleErrors).toHaveLength(0);
      });
    }
  }
});

test.describe('Modal Interaction Tests', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('ESC key closes modal', async ({ page }) => {
    await page.goto(`${BASE_URL}?t=${Date.now()}`);
    await page.waitForLoadState('networkidle');

    await page.locator('#obras .project-card').first().click();
    await page.waitForTimeout(300);

    const modal = page.locator('#quick-view');
    await expect(modal).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('Click outside closes modal', async ({ page }) => {
    await page.goto(`${BASE_URL}?t=${Date.now()}`);
    await page.waitForLoadState('networkidle');

    await page.locator('#proyectos .project-card').first().click();
    await page.waitForTimeout(300);

    const modal = page.locator('#quick-view');
    await expect(modal).toBeVisible();

    // Click at top-left corner (definitely on overlay, not content)
    await page.mouse.click(50, 50);
    await expect(modal).toBeHidden();
  });
});
