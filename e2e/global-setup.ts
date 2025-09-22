import { chromium, type Browser, type Page } from '@playwright/test'

// Global setup for E2E tests
async function globalSetup() {
  console.log('Setting up E2E test environment...')

  // Set up test environment variables if needed
  // Note: NODE_ENV is read-only in newer Node.js versions, but Playwright should handle this

  // You can add global setup logic here
  // For example, seeding test data, setting up test users, etc.

  console.log('E2E test environment setup complete.')
}

export default globalSetup
