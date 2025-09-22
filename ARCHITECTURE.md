# Architecture Decisions

## Why This Stack?

- **Next.js 15**: Latest App Router for modern React development, Server Components, and optimal performance
- **tRPC**: Type-safe APIs without REST/GraphQL complexity, eliminating the need for separate API documentation
- **Drizzle ORM**: Simple, type-safe database ORM with excellent TypeScript inference and zero-runtime overhead
- **Supabase**: Managed PostgreSQL with real-time features, authentication, and storage capabilities
- **React 19**: Latest stable with concurrent features and improved Server Components support
- **TypeScript 5.5+**: Strict mode for maximum type safety and developer experience

## Architecture Principles

### 1. Type Safety First
- **End-to-end type safety** from database schema to API responses to UI components
- **Runtime validation** with Zod schemas for all external inputs
- **Zero `any` types** in production code (warnings only in tests/mocks)

### 2. Developer Experience
- **Hot reload** for instant feedback during development
- **Comprehensive testing** with unit, integration, and E2E coverage
- **Modern tooling** with ESLint, Prettier, and TypeScript strict mode
- **Clear separation of concerns** with logical folder organization

### 3. Performance & Scalability
- **Server Components** for static content to reduce client-side JavaScript
- **Route groups** for logical organization without affecting URL structure
- **Database optimizations** with proper indexing and query optimization
- **Bundle optimization** with Next.js built-in optimizations

## Project Structure Philosophy

```
src/
├── app/                    # Next.js App Router (pages & API routes)
│   ├── (auth)/           # Authentication routes (grouped)
│   ├── (dashboard)/      # Dashboard routes (grouped)
│   ├── api/              # API routes (translate, history, etc.)
│   └── _components/      # Layout providers & shared components
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui design system components
│   ├── forms/           # Form-specific components
│   ├── animations/      # Motion & transition components
│   └── upload/          # File upload components
├── server/              # Backend logic
│   ├── api/            # tRPC procedures (type-safe API layer)
│   └── trpc.ts         # tRPC configuration & middleware
├── lib/                 # Business logic & integrations
│   ├── db/             # Database schema, migrations, client
│   ├── validations/    # Input validation schemas
│   ├── gemini.ts       # AI integration logic
│   ├── parser.ts       # Code parsing & analysis
│   └── patterns.ts     # Machine learning pattern recognition
├── types/               # Shared TypeScript definitions
└── utils/               # Shared utilities & helpers
```

## Database Design

- **PostgreSQL** with proper foreign key relationships
- **Audit trails** on all tables (created_at, updated_at, created_by, updated_by)
- **Soft deletes** for data integrity (is_deleted, deleted_at, deleted_by)
- **Proper indexing** for optimal query performance
- **Enum types** for consistent categorization

## API Design

- **tRPC procedures** for type-safe, self-documenting APIs
- **Input validation** with Zod schemas for all endpoints
- **Error handling** with proper HTTP status codes and error messages
- **Authentication middleware** for protected routes
- **Rate limiting** considerations for AI API calls

## Testing Strategy

- **Unit tests** for business logic and utilities
- **Integration tests** for API workflows and database operations
- **E2E tests** for critical user journeys
- **Test coverage** maintained above 85% for core functionality
- **Mock setup** for external dependencies (AI APIs, databases)

## Deployment & DevOps

- **Zero-config deployment** with Vercel/Netlify
- **Environment-based configuration** for different stages
- **Database migrations** handled through Drizzle Kit
- **Static site generation** for optimal performance
- **CDN optimization** for global performance

## Security Considerations

- **Input validation** at all entry points
- **SQL injection prevention** through parameterized queries
- **XSS protection** through proper sanitization
- **CSRF protection** via NextAuth.js
- **Rate limiting** for API endpoints
- **Environment variables** for sensitive configuration

---

*This architecture supports rapid development while maintaining production-grade code quality and scalability.*
