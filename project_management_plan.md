# CLIENT FEEDBACK TRANSLATOR - PROJECT MANAGEMENT

## PROJECT SETUP

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### Package.json Dependencies
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@google/generative-ai": "^0.17.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "class-variance-authority": "^0.7.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.5.0",
    "eslint": "^8.57.0",
    "@babel/parser": "^7.24.0",
    "@babel/traverse": "^7.24.0",
    "@types/babel__parser": "^7.1.0",
    "@types/babel__traverse": "^7.20.0"
  }
}
```

## FILE STRUCTURE

```
client-feedback-translator/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       ├── translate/
│       │   └── route.ts
│       ├── translations/
│       │   └── route.ts
│       └── translations/[id]/rating/
│           └── route.ts
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   └── dialog.tsx
│   ├── FileUpload.tsx
│   ├── FeedbackInput.tsx
│   ├── ResultsDisplay.tsx
│   ├── CodeComparison.tsx
│   ├── TranslationHistory.tsx
│   └── RatingSystem.tsx
├── lib/
│   ├── supabase.ts
│   ├── gemini.ts
│   ├── parser.ts
│   ├── patterns.ts
│   └── types.ts
├── utils/
│   ├── validation.ts
│   └── cn.ts
└── public/
    └── examples/
        ├── Button.jsx
        ├── Card.jsx
        └── Form.jsx
```

## DAY 1 IMPLEMENTATION CHECKLIST

### Hour 1: Project Setup
- [ ] Create Next.js 15 project: `npx create-next-app@latest`
- [ ] Install dependencies from package.json
- [ ] Setup Supabase project and get API keys
- [ ] Get Gemini API key from Google AI Studio
- [ ] Configure environment variables
- [ ] Setup Tailwind CSS v4
- [ ] Initialize shadcn/ui components

### Hour 2-3: Database & API Foundation
- [ ] Create Supabase tables (translations, feedback_patterns)
- [ ] Setup Supabase client in `lib/supabase.ts`
- [ ] Create Gemini client in `lib/gemini.ts`
- [ ] Build `/api/translate` endpoint
- [ ] Implement Zod schema for AI response validation
- [ ] Test API with basic prompt

### Hour 4-5: File Upload & Parsing
- [ ] Build `FileUpload.tsx` component with drag/drop
- [ ] Create file validation logic
- [ ] Build React component parser in `lib/parser.ts` using Babel AST
- [ ] Extract component name, props, styling
- [ ] Test with sample React files

### Hour 6-7: AI Translation Core
- [ ] Engineer Gemini 2.5 Flash prompt with new output format (actionable vs. noted changes)
- [ ] Build translation logic in `lib/gemini.ts`
- [ ] Parse AI responses into structured format
- [ ] Add confidence scoring
- [ ] Test with various feedback examples

### Hour 8: Basic UI
- [ ] Create main page layout
- [ ] Build basic `FeedbackInput.tsx`
- [ ] Build basic `ResultsDisplay.tsx`
- [ ] Connect frontend to API
- [ ] Test end-to-end flow

**DAY 1 DELIVERABLE:** Working prototype that accepts file + feedback → returns actionable changes

## DAY 2 IMPLEMENTATION CHECKLIST

### Hour 1-2: UI Enhancement
- [ ] Style `FileUpload.tsx` with proper drag/drop states
- [ ] Build `CodeComparison.tsx` with syntax highlighting
- [ ] Add copy-to-clipboard functionality
- [ ] Create loading states and animations
- [ ] Add error handling UI

### Hour 3-4: Learning System
- [ ] Build `RatingSystem.tsx` component
- [ ] Create `/api/translations/[id]/rating` endpoint
- [ ] Implement pattern storage in `lib/patterns.ts`
- [ ] Build feedback pattern matching
- [ ] Add suggestion improvements

### Hour 5: History & Polish
- [ ] Build `TranslationHistory.tsx` component
- [ ] Add search and filter functionality
- [ ] Create responsive design
- [ ] Add keyboard shortcuts
- [ ] Polish animations and transitions

### Hour 6: Error Handling & Validation
- [ ] Add comprehensive file validation
- [ ] Handle API errors gracefully
- [ ] Add rate limiting protection
- [ ] Create fallback states
- [ ] Test edge cases

### Hour 7: Testing & Bug Fixes
- [ ] Test with various React component formats
- [ ] Test AI response parsing edge cases
- [ ] Verify database operations
- [ ] Check responsive design
- [ ] Fix any critical bugs

### Hour 8: Deployment
- [ ] Deploy to Vercel
- [ ] Set up environment variables in production
- [ ] Test production deployment
- [ ] Create demo data
- [ ] Prepare presentation materials

**DAY 2 DELIVERABLE:** Production-ready demo with learning system

## CRITICAL IMPLEMENTATION NOTES

### File Parser Requirements
```typescript
// Implementation must use Babel AST parsing for reliability.
// Must handle these React patterns:
- Functional components with hooks
- Class components (legacy support)
- Tailwind CSS classes
- Inline styles
- Styled-components
- CSS modules
- Component props and defaultProps
```

### Gemini Prompt Engineering
```typescript
// Must include in every prompt:
- Component context (type, current styling)
- Design system context (modern, SaaS, etc.)
- Output format specification (JSON schema)
- Confidence scoring requirements
- Change type categorization
- Must distinguish between actionable in-file changes and noted external requirements
```

### Database Performance
```sql
-- Required indexes for performance
CREATE INDEX idx_translations_created_at ON translations(created_at DESC);
CREATE INDEX idx_feedback_patterns_pattern ON feedback_patterns USING gin(to_tsvector('english', pattern));
CREATE INDEX idx_translations_component_name ON translations(component_name);
```

### API Response Handling
- **Validation**: Implement a validation layer using Zod to parse and sanitize all responses from the Gemini API. This creates a robust "anti-corruption layer" against malformed or unexpected JSON structures.
- **Error Handling**: If a response fails Zod validation, the API should return a standardized error to the client, and the incident should be logged for debugging.

## TESTING SCENARIOS

### Component Types to Test
1. **Button Component** with Tailwind classes
2. **Card Component** with CSS modules
3. **Form Component** with styled-components
4. **Navigation** with inline styles
5. **Modal** with complex structure

### Feedback Types to Test
1. Vague: "make it pop", "feels off", "not premium"
2. Specific: "button too small", "colors don't match brand"
3. Technical: "needs better accessibility", "performance issues"
4. Design: "spacing inconsistent", "typography hierarchy unclear"

### API Response Validation
```typescript
interface ValidationChecks {
  responseTime: number; // < 3 seconds
  confidenceScore: number; // 0.0 - 1.0
  changeTypes: string[]; // valid types only
  codeValidity: boolean; // generated code is valid
  jsonStructure: boolean; // proper JSON format
}
```

## DEPLOYMENT CHECKLIST

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] Rate limiting configured

### Post-deployment
- [ ] Health check endpoints working
- [ ] Database connectivity verified
- [ ] File upload limits working
- [ ] AI API integration functional
- [ ] Demo scenarios tested

## SUCCESS METRICS

### Technical KPIs
- **Response Time**: < 3 seconds per translation
- **Success Rate**: > 95% successful file parsing
- **Confidence Score**: Average > 0.8
- **Error Rate**: < 5% API failures

### Demo KPIs
- **Parsing Accuracy**: Correctly extracts styling from uploaded components
- **Translation Quality**: Actionable, specific code changes
- **User Experience**: Smooth file upload → results flow
- **Visual Polish**: Professional UI that impresses stakeholders

## RISK MITIGATION

### High Risk Items
1. **Gemini API Rate Limits** → Implement exponential backoff
2. **File Parsing Failures** → Comprehensive validation + fallbacks
3. **AI Response Quality** → Prompt engineering + confidence thresholds
4. **Deployment Issues** → Test deployment early Day 2

### Contingency Plans
- **AI Fails**: Fallback to pattern matching from database
- **File Upload Breaks**: Direct text input as backup
- **Database Issues**: Local storage fallback for demo
- **Styling Problems**: Use shadcn/ui defaults

This project management file contains everything needed for successful 2-day execution.