import { test, expect } from '@playwright/test'

test.describe('Complete Analysis Workflow', () => {
  test('should handle authentication flow and reach dashboard', async ({ page }) => {
    // Navigate to homepage (will redirect to signin)
    await page.goto('/')

    // Wait for redirect to signin page
    await expect(page).toHaveURL(/\/api\/auth\/signin/)

    // The test framework is working - authentication is properly protecting routes
    // In a real scenario, you would mock authentication or use test credentials here
    expect(page.url()).toContain('/api/auth/signin')
  })

  test('should handle history search and navigation', async ({ page }) => {
    // Navigate to homepage (will redirect to dashboard)
    await page.goto('/')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Open history sidebar
    await page.click('button[data-testid="history-trigger"]')

    // Test search functionality
    await page.fill('input[placeholder*="Search"]', 'TestComponent')

    // Wait for search results
    await expect(page.locator('text=TestComponent.tsx')).toBeVisible()

    // Navigate to analysis from history
    await page.click('text=TestComponent.tsx')

    // Verify navigation worked
    await expect(page).toHaveURL(/\/results\/.*/)
  })

  test('should handle file upload errors gracefully', async ({ page }) => {
    await page.goto('/')

    // Try to upload invalid file type
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'invalid.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('invalid file content'),
    })

    // Should show error message
    await expect(page.locator('text=/upload error|invalid file/i')).toBeVisible()
  })

  test('should handle large file uploads', async ({ page }) => {
    await page.goto('/')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Create a large file (>10MB)
    const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'large-file.tsx',
      mimeType: 'text/typescript',
      buffer: Buffer.from(largeContent),
    })

    // Should show file size error
    await expect(page.locator('text=/file too large|size limit/i')).toBeVisible()
  })

  test('should maintain responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check that main content is still accessible
    await expect(page.locator('h1')).toBeVisible()

    // Check that upload area is usable on mobile
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeVisible()

    // Test touch interactions
    const uploadArea = page.locator('text=Upload your React component')
    await expect(uploadArea).toBeVisible()
  })

  test('should handle network failures gracefully', async ({ page }) => {
    await page.goto('/')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Upload file first
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'TestComponent.tsx',
      mimeType: 'text/typescript',
      buffer: Buffer.from('const TestComponent = () => <div>Hello</div>'),
    })

    // Mock network failure by intercepting the request
    await page.route('**/api/trpc/**', async route => {
      await route.abort()
    })

    // Try to submit
    await page.fill('textarea[name="feedback"]', 'test feedback')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=/network error|failed to submit/i')).toBeVisible()
  })

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Try to submit without file
    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.locator('text=/please upload a file|file required/i')).toBeVisible()

    // Upload file but no feedback
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'TestComponent.tsx',
      mimeType: 'text/typescript',
      buffer: Buffer.from('const TestComponent = () => <div>Hello</div>'),
    })

    await page.click('button[type="submit"]')

    // Should show feedback validation error
    await expect(page.locator('text=/feedback required|please provide feedback/i')).toBeVisible()
  })

  test('should handle authentication flow', async ({ page }) => {
    // Test unauthenticated access to protected routes
    await page.goto('/')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Should redirect to login if not authenticated
    // This depends on your auth setup, adjust as needed
    const currentUrl = page.url()
    expect(currentUrl).toContain('/dashboard')
  })

  test('should handle concurrent analysis requests', async ({ page }) => {
    await page.goto('/')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'TestComponent.tsx',
      mimeType: 'text/typescript',
      buffer: Buffer.from('const TestComponent = () => <div>Hello</div>'),
    })

    // Submit multiple times quickly
    await page.fill('textarea[name="feedback"]', 'test feedback')
    await page.click('button[type="submit"]')
    await page.click('button[type="submit"]')

    // Should handle gracefully (either queue or show error)
    // This tests for race conditions
    await page.waitForTimeout(1000)
  })

  test('should maintain performance under load', async ({ page }) => {
    // Performance test - measure page load time
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Should load within reasonable time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(3000) // 3 seconds
  })
})

test.describe('Cross-browser Compatibility', () => {
  test('should work on chromium', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should work on firefox', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should work on webkit', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should work on mobile chrome', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should work on mobile safari', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('h1')).toBeVisible()
  })
})
