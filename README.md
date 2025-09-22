# Client Feedback Translator

[![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/client-feedback-translator/ci.yml)](https://github.com/your-username/client-feedback-translator/actions)
[![Test Coverage](https://img.shields.io/codecov/c/github/your-username/client-feedback-translator)](https://codecov.io/gh/your-username/client-feedback-translator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)](https://www.typescriptlang.org/)

A production-ready web application that uses AI to translate client feedback into actionable code changes. Built with Next.js 15, React 19, and TypeScript.

## Features

- **AI-Powered Analysis**: Translates natural language feedback into precise code modifications using Gemini 2.5 Flash
- **Multi-Framework Support**: Analyzes React components, Tailwind CSS, CSS Modules, and Styled Components
- **Interactive Code Diff**: Side-by-side comparison of proposed changes with explanations
- **Translation History**: Persistent storage of all feedback translations with user ratings
- **Secure File Upload**: Drag-and-drop file upload with comprehensive validation
- **Modern UI**: Responsive design built with shadcn/ui and Tailwind CSS v4

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5.5+
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Backend**: tRPC for type-safe APIs, NextAuth.js v5 for authentication
- **Database**: Supabase with PostgreSQL, Drizzle ORM
- **AI**: Google Gemini 2.5 Flash
- **Testing**: Vitest, Playwright, Testing Library
- **Development**: ESLint, Prettier, TypeScript strict mode

## Project Structure

```
client-feedback-translator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (tRPC, NextAuth)
│   │   ├── dashboard/         # Dashboard page
│   │   ├── results/           # Results pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── forms/            # Form components
│   │   ├── animations/       # Motion components
│   │   ├── upload/           # File upload components
│   │   ├── history/          # History components
│   │   └── results/          # Results display components
│   ├── server/               # Backend logic
│   │   ├── api/             # tRPC procedures
│   │   └── trpc.ts          # tRPC configuration
│   ├── lib/                  # Business logic
│   │   ├── db/              # Database schema & client
│   │   ├── validations/     # Zod validation schemas
│   │   ├── gemini.ts        # AI client setup
│   │   ├── parser.ts        # Code parsing logic
│   │   └── utils.ts         # Utility functions
│   ├── test/                # Test utilities
│   │   ├── fixtures/        # Test data
│   │   ├── integration/     # Integration tests
│   │   ├── mocks/           # API mocks
│   │   └── utils/           # Test helpers
│   └── utils/               # Shared utilities
│       └── trpc.ts          # tRPC client
├── public/                  # Static assets
├── e2e/                     # End-to-end tests
└── docs/                    # Documentation
```

## Installation

### Prerequisites

- Node.js 20+
- npm or yarn
- Google Cloud project with Gemini API access
- Supabase project

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/client-feedback-translator.git
cd client-feedback-translator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env.local` file with the following variables:

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
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm test` - Run test suite
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run db:generate` - Generate database schema
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Drizzle Studio

### Database Setup

The project uses Drizzle ORM with PostgreSQL. Run the following to set up your database:

```bash
# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Open database studio (optional)
npm run db:studio
```

## API Reference

### tRPC Procedures

The application uses tRPC for type-safe API procedures. All procedures are defined in `src/server/api/routers/`.

#### Translation API

**Create Translation**
```typescript
// Input
{
  feedback: string; // min: 1, max: 500
  componentCode: string; // min: 1, max: 50000
}

// Response
{
  id: string;
  interpretation: string;
  changes: Array<{
    type: 'css' | 'props' | 'structure' | 'animation';
    before: string;
    after: string;
    explanation: string;
  }>;
  confidence: number; // 0.0 - 1.0
  reasoning: string;
}
```

**Get Translation History** (Infinite Query)
```typescript
// Input
{
  limit?: number; // default: 10, max: 100
  cursor?: number;
}

// Response
{
  items: Array<{
    id: string;
    originalFeedback: string;
    componentCode: string;
    generatedChanges: any;
    confidenceScore: number;
    userRating?: number;
    createdAt: Date;
  }>;
  nextCursor?: number;
}
```

**Rate Translation**
```typescript
// Input
{
  rating: number; // 1-5
}

// Response
{
  success: boolean;
}
```

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Install dependencies: `npm install`
4. Make your changes
5. Add tests for new functionality
6. Ensure all tests pass: `npm test`
7. Commit with conventional commits: `git commit -m 'feat: add new feature'`
8. Push to your branch: `git push origin feature/your-feature-name`
9. Open a Pull Request

### Code Standards

- TypeScript strict mode enabled
- ESLint and Prettier configuration enforced
- Unit tests required for new features
- Follow existing code patterns and conventions
- Update documentation for API changes

### Testing Requirements

- Unit tests: `npm run test`
- Type checking: `npm run type-check`
- Linting: `npm run lint`
- All CI checks must pass

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

Built with Next.js, React, and TypeScript.
