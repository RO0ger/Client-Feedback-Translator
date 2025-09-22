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
│   │   ├── (auth)/           # Authentication routes
│   │   │   └── auth/         # NextAuth configuration
│   │   ├── (dashboard)/      # Dashboard routes
│   │   │   └── dashboard/    # Dashboard page
│   │   ├── api/              # API routes
│   │   │   ├── translate/    # Translation API
│   │   │   ├── trpc/         # tRPC endpoints
│   │   │   └── translations/ # Translation history
│   │   ├── results/          # Results pages
│   │   ├── _components/      # Layout providers
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── forms/           # Form components
│   │   ├── animations/      # Motion components
│   │   ├── upload/          # File upload components
│   │   ├── history/         # History components
│   │   └── results/         # Results display components
│   ├── server/              # Backend logic
│   │   ├── api/            # tRPC procedures
│   │   └── trpc.ts         # tRPC configuration
│   ├── lib/                 # Business logic
│   │   ├── db/             # Database schema & client
│   │   ├── validations/    # Zod validation schemas
│   │   ├── gemini.ts       # AI client setup
│   │   ├── parser.ts       # Code parsing logic
│   │   ├── patterns.ts     # AI pattern learning
│   │   ├── supabase.ts     # Database client
│   │   └── utils.ts        # Utility functions
│   ├── test/               # Test utilities
│   │   ├── fixtures/       # Static test data
│   │   ├── helpers/        # 🆕 Test helper utilities & factories
│   │   ├── integration/    # Integration tests
│   │   ├── mocks/          # API mocks
│   │   └── utils/          # Test utilities (re-exports helpers)
│   ├── types/              # TypeScript definitions
│   └── utils/              # Shared utilities
│       └── trpc.ts         # tRPC client
├── public/                 # Static assets
├── e2e/                    # End-to-end tests
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # Design decisions & rationale
│   └── CONTRIBUTING.md     # Development guide
└── .gitignore              # Git ignore patterns
```

## Quick Start

Get up and running in 3 simple commands:

```bash
# 1. Clone and install
git clone https://github.com/your-username/client-feedback-translator.git
cd client-feedback-translator && npm install

# 2. Set up environment variables
# Create .env.local file with your actual API keys

# 3. Start development
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Installation

### Prerequisites

- Node.js 20+
- Google Cloud project with Gemini API access
- Supabase project

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
    type: "css" | "props" | "structure" | "animation";
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

I welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

For a high-level overview of the architecture and design decisions, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

Built with Next.js, React, and TypeScript.
