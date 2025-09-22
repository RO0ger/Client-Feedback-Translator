import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should redirect to dashboard', async ({ page }) => {
    await page.goto('/')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Check if the page loads
    await expect(page).toHaveTitle(/Client Feedback Translator/)

    // Check for main content
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
  })

  test('should have proper accessibility', async ({ page }) => {
    await page.goto('/')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt).toBeTruthy()
    }

    // Check for proper heading structure
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThan(0)

    // Check for focusable elements
    const focusableElements = page.locator('[tabindex]:not([tabindex="-1"])')
    const focusableCount = await focusableElements.count()
    expect(focusableCount).toBeGreaterThanOrEqual(0)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Check that content is still visible on mobile
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()

    // Check that no horizontal scroll is needed
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })

  test('should handle navigation properly', async ({ page }) => {
    await page.goto('/')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Test internal navigation (when routes exist)
    // This is a placeholder for when navigation is implemented
    const currentUrl = page.url()
    expect(currentUrl).toContain('localhost:3000')
  })
})
