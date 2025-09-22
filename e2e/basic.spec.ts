import { test, expect } from '@playwright/test'

test('basic homepage test', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/')

  // Basic check that the page loads
  await expect(page).toHaveTitle(/Client Feedback Translator/)

  // Check for basic content structure
  const body = page.locator('body')
  await expect(body).toBeVisible()
})
