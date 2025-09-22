# Contributing Guide

Welcome to the Client Feedback Translator project! This guide will help you get started with contributing to the codebase.

## Quick Start

Get up and running in 3 simple steps:

```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd client-feedback-translator
npm install

# 2. Set up environment variables
# Create .env.local with your API keys (see .env.example for reference)

# 3. Start development
npm run dev
```

## Development Workflow

### Prerequisites

- **Node.js 20+**
- **npm or yarn** (npm recommended)
- **Google Cloud** project with Gemini API access
- **Supabase** project for database

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# AI Integration
GEMINI_API_KEY="your_gemini_api_key"

# Authentication (NextAuth.js)
AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Optional: OAuth Providers
# GOOGLE_CLIENT_ID="your_google_client_id"
# GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Create production build
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues automatically
npm run type-check      # Run TypeScript checks
npm run production:check # Full production validation

# Testing
npm run test           # Run all tests
npm run test:ui        # Run tests with UI
npm run test:coverage  # Run tests with coverage report
npm run test:e2e       # Run E2E tests
npm run test:e2e:ui    # Run E2E tests with UI
npm run test:e2e:debug # Debug E2E tests

# Database
npm run db:generate    # Generate database schema
npm run db:push       # Push schema to database
npm run db:migrate    # Run database migrations
npm run db:studio     # Open Drizzle Studio
```

## Code Standards

### TypeScript

- **Strict mode enabled** - No `any` types in production code
- **Proper interfaces** for all data structures
- **Runtime validation** with Zod schemas
- **Type inference** over explicit typing where possible

### File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (route-groups)/    # Route groups for organization
│   ├── api/               # API routes
│   └── _components/       # Shared layout components
├── components/            # UI components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form-specific components
│   └── [feature]/        # Feature-specific components
├── server/               # Backend logic
│   ├── api/             # tRPC procedures
│   └── trpc.ts          # tRPC configuration
├── lib/                  # Business logic
│   ├── db/              # Database operations
│   ├── validations/     # Input validation
│   └── [integration]/   # External service integrations
└── types/                # TypeScript definitions
```

### Naming Conventions

- **Components**: PascalCase (e.g., `FeedbackForm`, `CodeDiff`)
- **Hooks**: camelCase with "use" prefix (e.g., `useFeedback`, `useAuth`)
- **Utils**: camelCase (e.g., `formatDate`, `validateInput`)
- **Types**: PascalCase (e.g., `UserProfile`, `FeedbackData`)
- **Constants**: UPPER_CASE (e.g., `MAX_FILE_SIZE`, `API_TIMEOUT`)

### Commit Messages

Use **conventional commits** format:

```bash
feat: add new feedback translation feature
fix: resolve infinite loading in dashboard
docs: update API documentation
style: improve component spacing
refactor: optimize database queries
test: add unit tests for translation service
chore: update dependencies
```

## Testing Guidelines

### Unit Tests

- **Test business logic** in isolation
- **Mock external dependencies** (APIs, databases)
- **Use descriptive test names** that explain the behavior
- **Follow Arrange-Act-Assert** pattern

```typescript
describe('FeedbackForm', () => {
  it('should show validation error for empty feedback', () => {
    // Arrange
    render(<FeedbackForm />);

    // Act
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Assert
    expect(screen.getByText(/feedback is required/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

- **Test API workflows** end-to-end
- **Include database operations** where relevant
- **Test error scenarios** and edge cases
- **Use realistic test data**

### E2E Tests

- **Test critical user journeys**
- **Include authentication flows**
- **Test responsive design** on different screen sizes
- **Verify accessibility** features

## Pull Request Process

### Before Submitting

1. **Run all tests**: `npm run production:check`
2. **Fix linting issues**: `npm run lint:fix`
3. **Update documentation** if adding new features
4. **Add tests** for new functionality
5. **Check TypeScript** compilation: `npm run type-check`

### PR Checklist

- [ ] **Tests pass**: All existing and new tests pass
- [ ] **TypeScript compiles**: No type errors
- [ ] **Linting passes**: ESLint shows no errors
- [ ] **Build succeeds**: Production build works
- [ ] **Documentation updated**: README, API docs, or code comments
- [ ] **Feature complete**: No TODO comments or incomplete functionality
- [ ] **Code reviewed**: Self-review completed

### PR Description Template

```markdown
## Description

Brief description of the changes and why they were made.

## Changes

- Added new feature X
- Fixed issue Y
- Updated documentation Z

## Testing

- Added unit tests for new functionality
- Updated integration tests
- Verified E2E workflows still work

## Screenshots (if applicable)

Before/after screenshots for UI changes.
```

## Common Issues & Solutions

### Database Issues

```bash
# Regenerate database schema
npm run db:generate

# Push schema changes
npm run db:push

# Reset database (development only)
npm run db:push -- --force
```

### TypeScript Issues

```bash
# Check for type errors
npm run type-check

# Fix common issues
npm run lint:fix
```

### Test Issues

```bash
# Run specific test file
npm run test feedback-form.test.tsx

# Debug failing tests
npm run test:e2e:debug
```

## Getting Help

- **Issues**: Create a GitHub issue with detailed description
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check ARCHITECTURE.md for design decisions
- **Code Review**: Follow the PR process for all changes

## Code of Conduct

- **Be respectful** to all contributors
- **Write clear, maintainable code**
- **Test thoroughly** before submitting
- **Document** new features and changes
- **Help others** when possible

---

*Thank you for contributing to the Client Feedback Translator project! Your help makes it better for everyone.*
