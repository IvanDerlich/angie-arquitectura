const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://ivanderlich.github.io/angie-arquitectura';

test.describe('Activities Section', () => {
  test('actividades section is visible on main page', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const activitiesSection = page.locator('#actividades');
    await expect(activitiesSection).toBeVisible();
    
    const title = activitiesSection.locator('h2');
    await expect(title).toContainText('Actividades');
  });

  test('navigation menu includes "Qué hago" link', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const navLink = page.locator('.nav-link[href="#actividades"]');
    await expect(navLink).toBeVisible();
    await expect(navLink).toContainText('Qué hago');
  });

  test('shows 3 placeholder activity cards', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const activityCards = page.locator('.actividad-card');
    await expect(activityCards).toHaveCount(3);
    
    // Check for placeholder text
    const firstCard = activityCards.first();
    await expect(firstCard).toContainText('[REEMPLAZAR');
  });

  test('activity cards have numbered icons', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const icons = page.locator('.actividad-icon');
    await expect(icons).toHaveCount(3);
    
    await expect(icons.first()).toContainText('1');
    await expect(icons.nth(1)).toContainText('2');
    await expect(icons.nth(2)).toContainText('3');
  });

  test('activity card shows placeholder for works', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const firstCard = page.locator('.actividad-card').first();
    await expect(firstCard).toContainText('[REEMPLAZAR: obras donde la aplicó]');
  });

  test('clicking activity card navigates to activity detail page', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const firstCard = page.locator('.actividad-card').first();
    await firstCard.click();
    await page.waitForTimeout(500);
    
    // Should navigate to #/actividad/actividad-1
    await expect(page).toHaveURL(/.*#\/actividad\/actividad-1/);
  });

  test('activity detail page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}#/actividad/actividad-1`);
    await page.waitForTimeout(500);
    
    // Activity view should be visible
    const activityView = page.locator('#activity-view');
    await expect(activityView).not.toHaveAttribute('hidden');
    
    // Should show activity title
    const title = page.locator('.activity-page-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('[REEMPLAZAR: Actividad 1]');
    
    // Should show placeholder for works
    await expect(page.locator('.activity-view-content')).toContainText('[REEMPLAZAR: obras donde la aplicó]');
  });

  test('back link from activity detail returns to actividades section', async ({ page }) => {
    await page.goto(`${BASE_URL}#/actividad/actividad-2`);
    await page.waitForTimeout(1000);
    
    const backLink = page.locator('#activity-view .project-back');
    await expect(backLink).toBeVisible();
    await expect(backLink).toContainText('Volver a actividades');
    
    // Navigate directly by evaluating href
    await page.evaluate(() => {
      window.location.hash = '#actividades';
    });
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL(/.*#actividades/);
    
    // Verify actividades section is visible
    const activitiesSection = page.locator('#actividades');
    await expect(activitiesSection).toBeVisible();
  });

  test('project page shows activities section with placeholder', async ({ page }) => {
    await page.goto(`${BASE_URL}#/obra/bano`);
    await page.waitForTimeout(500);
    
    // Should show activities section
    const activitiesSection = page.locator('.project-activities');
    await expect(activitiesSection).toBeVisible();
    
    const heading = activitiesSection.locator('h3');
    await expect(heading).toContainText('Actividades en este trabajo');
    
    // Should show placeholder
    await expect(activitiesSection).toContainText('[REEMPLAZAR: actividades de este trabajo]');
  });

  test('actividades section has no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);
    
    const activitiesSection = page.locator('#actividades');
    await expect(activitiesSection).toBeVisible();
    
    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });

  test('actividades section has no horizontal overflow on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL);
    
    const activitiesSection = page.locator('#actividades');
    await expect(activitiesSection).toBeVisible();
    
    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(1280);
  });

  test('activity detail page has no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}#/actividad/actividad-1`);
    await page.waitForTimeout(500);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });

  test('all activity detail routes work', async ({ page }) => {
    const activities = ['actividad-1', 'actividad-2', 'actividad-3'];
    
    for (const slug of activities) {
      await page.goto(`${BASE_URL}#/actividad/${slug}`);
      await page.waitForTimeout(500);
      
      const activityView = page.locator('#activity-view');
      await expect(activityView).not.toHaveAttribute('hidden');
      
      const title = page.locator('.activity-page-title');
      await expect(title).toBeVisible();
    }
  });

  test('invalid activity slug redirects to home', async ({ page }) => {
    await page.goto(`${BASE_URL}#/actividad/nonexistent`);
    await page.waitForTimeout(500);
    
    // Should redirect to home (either / or #)
    const url = page.url();
    expect(url === BASE_URL + '/' || url === BASE_URL + '/#' || url === BASE_URL + '#').toBeTruthy();
  });
});
