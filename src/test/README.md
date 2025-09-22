# Testing Infrastructure

This directory contains the complete testing infrastructure for the Client Feedback Translator application.

## Overview

The testing setup includes:
- **Vitest** for unit and integration tests
- **Playwright** for end-to-end tests
- **MSW (Mock Service Worker)** for API mocking
- **Testing Library** for component testing
- **Custom test utilities** for consistent test patterns

## Directory Structure

```
src/test/
├── README.md              # This file
├── setup.tsx             # Global test setup and configuration
├── helpers/              # 🆕 Test helper utilities
│   ├── render.tsx        # Custom render function with providers
│   ├── factories.ts      # Test data factories
│   └── index.ts          # Helper exports
├── mocks/                # API mocks and test data
│   ├── server.ts         # MSW server configuration
│   └── auth.ts           # Authentication mocks
├── utils/                # Test utilities and providers
│   └── test-utils.tsx    # Main test utilities (re-exports helpers)
├── fixtures/             # Static test data
└── integration/          # Integration tests
```

## Test Organization Philosophy

### Component Tests
- **Location**: Next to the component they test
- **Pattern**: `component.test.tsx` or `component.spec.tsx`
- **Purpose**: Test individual components in isolation

### Integration Tests
- **Location**: `src/test/integration/`
- **Purpose**: Test API workflows and business logic
- **Files**: `*.test.tsx`

### API/Server Tests
- **Location**: Next to the API routes or in dedicated folders
- **Purpose**: Test tRPC procedures and server logic
- **Pattern**: `*.test.ts`

### Test Utilities
- **Location**: `src/test/helpers/` and `src/test/utils/`
- **Purpose**: Reusable test helpers and setup functions

## Quick Start

### Unit Tests
```bash
npm test                    # Run tests in watch mode
npm run test:run           # Run tests once
npm run test:coverage      # Run tests with coverage
npm run test:ui           # Run tests with UI
```

### E2E Tests
```bash
npm run test:e2e           # Run E2E tests
npm run test:e2e:ui       # Run E2E tests with UI
npm run test:e2e:debug    # Debug E2E tests
```

### Playwright Setup
```bash
npm run playwright:install          # Install Playwright browsers
npm run playwright:install-deps     # Install system dependencies
```

## Writing Tests

### Unit Tests

Use the custom render function that includes all providers:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)

    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

### Component Tests with tRPC

For components that use tRPC:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@/test/utils/test-utils'
import { MyTRPCComponent } from './MyTRPCComponent'

describe('MyTRPCComponent', () => {
  it('loads data successfully', async () => {
    render(<MyTRPCComponent />)

    await waitFor(() => {
      expect(screen.getByText('Data loaded')).toBeInTheDocument()
    })
  })
})
```

### Mocking tRPC Responses

Use MSW to mock tRPC endpoints:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@/test/utils/test-utils'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('MyComponent with mocked API', () => {
  it('handles API response', async () => {
    // Override the default mock
    server.use(
      http.post('http://localhost:3000/api/trpc/myEndpoint', () => {
        return HttpResponse.json({
          result: { data: { customData: 'test' } }
        })
      })
    )

    render(<MyComponent />)

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument()
    })
  })
})
```

### E2E Tests

Write E2E tests using Playwright:

```tsx
import { test, expect } from '@playwright/test'

test('user can submit feedback', async ({ page }) => {
  await page.goto('/')

  // Fill out the feedback form
  await page.fill('[data-testid="feedback-content"]', 'Great app!')
  await page.selectOption('[data-testid="feedback-rating"]', '5')
  await page.click('[data-testid="submit-feedback"]')

  // Verify success message
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

## Test Utilities

### Mock Data Helpers

```tsx
import { createMockUser, createMockFeedback } from '@/test/utils/test-utils'

const user = createMockUser({ name: 'John Doe' })
const feedback = createMockFeedback({ rating: 4 })
```

### Authentication Helpers

```tsx
import { mockAuthenticatedUser, mockUnauthenticatedUser } from '@/test/mocks/server'

// In your test
mockAuthenticatedUser({ id: 'user-123', email: 'test@example.com' })
```

### API Error Mocking

```tsx
import { mockApiError } from '@/test/mocks/server'

// Mock an API error
mockApiError('feedback.create', {
  code: 'BAD_REQUEST',
  message: 'Invalid feedback data'
})
```

## Best Practices

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow the pattern: `it('should [expected behavior] when [condition]')`

### 2. Component Testing
- Test user interactions, not implementation details
- Use `data-testid` attributes for elements that need testing
- Test accessibility features
- Mock external dependencies

### 3. API Testing
- Mock API responses for predictable tests
- Test both success and error scenarios
- Verify loading states and error handling

### 4. E2E Testing
- Test complete user journeys
- Use realistic test data
- Test on multiple browsers and devices
- Avoid testing implementation details

## Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Key user flows
- **E2E Tests**: Critical user journeys
- **Accessibility**: WCAG 2.1 AA compliance

## Continuous Integration

Tests are configured to run in CI with:
- Parallel test execution
- Coverage reporting
- Screenshots/videos on failure
- Accessibility audits

## Troubleshooting

### Common Issues

1. **MSW not intercepting requests**
   - Ensure MSW server is started in test setup
   - Check request URLs match exactly

2. **Component not rendering**
   - Make sure all required providers are included
   - Check for missing imports or dependencies

3. **E2E tests failing**
   - Ensure dev server is running
   - Check network requests are properly mocked
   - Verify test selectors are correct

### Debug Mode

Run tests with debug flags:
```bash
npm run test:run -- --reporter=verbose
npm run test:e2e:debug
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
