# CLIENT FEEDBACK TRANSLATOR - TECHNICAL PRD

## PROBLEM
Lyra devs waste 3-5 hours per project translating vague client feedback into actionable code changes.

## SOLUTION
AI tool that converts subjective feedback + React component code → specific technical changes with reasoning.

## TECHNICAL ARCHITECTURE

### STACK
- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API routes, Gemini 2.5 Flash API
- **Database**: Supabase (PostgreSQL) - latest 2025 version
- **File Storage**: Supabase Storage
- **Runtime**: Node.js 20+ (Node.js 18 EOL as of April 2025)
- **Deployment**: Vercel

### DATABASE SCHEMA

```sql
-- translations table
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_feedback TEXT NOT NULL,
  component_code TEXT NOT NULL,
  component_name TEXT,
  generated_changes JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  user_rating INTEGER, -- 1-5 stars
  created_at TIMESTAMP DEFAULT NOW()
);

-- feedback_patterns table (learning system)
CREATE TABLE feedback_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern TEXT NOT NULL,
  common_solutions JSONB NOT NULL,
  success_rate DECIMAL(3,2),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API ENDPOINTS

```typescript
// POST /api/translate
interface TranslateRequest {
  feedback: string;
  componentCode: string;
  componentName?: string;
}

interface TranslateResponse {
  interpretation: string;
  actionable_changes: Change[];
  external_dependencies_noted?: string[];
  parent_component_changes_noted?: string[];
  confidence: number;
  reasoning: string;
}

interface Change {
  type: 'css' | 'props' | 'structure' | 'animation';
  before: string;
  after: string;
  explanation: string;
}

// GET /api/translations
// POST /api/translations/:id/rating
```

### CORE FEATURES

#### 1. File Upload & Parsing
- Drag/drop .jsx/.tsx files
- Extract component props, styling, structure
- Parse Tailwind classes, inline styles, styled-components
- Store parsed data in structured format

#### 2. AI Translation Engine
- **Gemini 2.5 Flash** with structured prompts (latest model as of August 2025)
- Context-aware analysis (component type, current styling)
- Pattern matching against known feedback types
- Confidence scoring based on feedback clarity

#### 3. Code Generation
- Specific CSS class changes
- Component prop modifications
- Animation/interaction additions
- Before/after code comparison

#### 4. Learning System
- Track successful translations (user ratings)
- Build pattern database of feedback → solution mappings
- Improve prompt engineering based on usage data
- Auto-suggest common solutions for similar feedback

### GEMINI PROMPT STRUCTURE

```
ROLE: Senior Frontend Developer & Designer

CONTEXT:
- Component: ${componentName}
- Current Code: ${componentCode}
- Client Type: B2B SaaS
- Design System: Modern, professional

CLIENT FEEDBACK: "${feedback}"

TASK: Translate this feedback into actionable code changes.

OUTPUT FORMAT (JSON):
{
  "interpretation": "What the client actually means",
  "actionable_changes": [
    {
      "type": "css|props|structure|animation",
      "before": "current code snippet",
      "after": "modified code snippet", 
      "explanation": "technical reasoning"
    }
  ],
  "external_dependencies_noted": [
    "e.g., 'framer-motion' for complex animations"
  ],
  "parent_component_changes_noted": [
    "e.g., 'The parent component must pass a new `onClick` prop.'"
  ],
  "confidence": 0.85,
  "reasoning": "Why these changes address the feedback"
}

CONSTRAINTS:
- Only suggest changes that improve UX
- Maintain existing functionality
- Use modern CSS/React patterns
- Consider accessibility
```

### UI COMPONENTS

#### Main Interface
```
[File Upload Area]
├── Drag/drop zone for .jsx/.tsx files
├── File preview with syntax highlighting
└── Component name auto-detection

[Feedback Input]
├── Textarea for client feedback
├── Context tags (urgent, design, performance)
└── Submit button

[Results Display]
├── Interpretation summary
├── Before/after code comparison
├── Copy-to-clipboard buttons
├── Confidence score badge
└── Rating system (1-5 stars)

[History Sidebar]
├── Recent translations
├── Filter by component type
└── Search functionality
```

### FILE PARSING LOGIC

The parsing logic will use the Babel Abstract Syntax Tree (AST) parser to reliably extract component information, avoiding the fragility of regex-based approaches.

```typescript
function parseComponent(code: string) {
  return {
    componentName: extractComponentName(code),
    props: extractProps(code),
    styling: {
      tailwind: extractTailwindClasses(code),
      inlineStyles: extractInlineStyles(code),
      styledComponents: extractStyledComponents(code)
    },
    structure: analyzeJSXStructure(code),
    imports: extractImports(code)
  };
}
```

### LEARNING ALGORITHM

```typescript
// Pattern recognition
function updatePatterns(feedback: string, solution: Change[], rating: number) {
  const pattern = extractFeedbackPattern(feedback);
  if (rating >= 4) {
    incrementPatternSuccess(pattern, solution);
  }
}

// Improved suggestions
function getSuggestedChanges(feedback: string, component: ParsedComponent) {
  const patterns = findMatchingPatterns(feedback);
  const suggestions = patterns.map(p => adaptSolutionToComponent(p.solution, component));
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}
```

## 2-DAY IMPLEMENTATION PLAN

### Day 1: Core Engine (8 hours)
1. **Setup** (1h): Next.js project, Supabase config, API setup
2. **File Upload** (2h): Drag/drop, file validation, parsing logic  
3. **AI Integration** (3h): Gemini API, prompt engineering, response parsing
4. **Database** (1h): Schema creation, basic CRUD operations
5. **Basic UI** (1h): File upload, feedback input, results display

### Day 2: Polish & Deploy (8 hours)
1. **UI Enhancement** (3h): Styling, animations, responsive design
2. **Learning System** (2h): Rating system, pattern storage, improved suggestions
3. **Error Handling** (1h): File validation, API error handling, user feedback
4. **Testing** (1h): Component parsing edge cases, AI response validation
5. **Deployment** (1h): Vercel deployment, environment variables

## SUCCESS METRICS
- Successfully parses 95% of uploaded React components
- Generates actionable changes with >80% confidence
- User ratings average >4/5 stars
- Processing time <3 seconds per translation

## TECHNICAL CONSTRAINTS
- Max file size: 100KB
- Supports .jsx, .tsx files only
- Requires valid React syntax
- **Gemini 2.5 Pro** API rate limits: Check current limits
- **Node.js 20+** required (18 is EOL)
- **Supabase**: Latest 2025 features and security updates

### Data Privacy & Security
- **Demo:** Store data temporarily with a 24-hour Time-to-Live (TTL).
- **Production:** Default to process-and-delete. Implement opt-in for users who want to contribute to the learning system.
- **Security:** Never store raw proprietary source code. Hash or anonymize component code before storage.

## DEMO SCENARIOS
1. **Button Component**: "Make it more premium" → Gradient, shadows, hover effects
2. **Card Component**: "Feels too cramped" → Padding, spacing, typography adjustments  
3. **Form Component**: "Not intuitive enough" → Label improvements, validation states
4. **Navigation**: "Doesn't feel modern" → Typography, animations, active states

## FILES TO CREATE

```
/
├── app/
│   ├── page.tsx (main interface)
│   ├── api/translate/route.ts
│   ├── api/translations/route.ts
│   └── globals.css
├── components/
│   ├── FileUpload.tsx
│   ├── FeedbackInput.tsx
│   ├── ResultsDisplay.tsx
│   └── TranslationHistory.tsx
├── lib/
│   ├── gemini.ts (AI integration)
│   ├── parser.ts (component parsing)
│   ├── supabase.ts (database client)
│   └── types.ts
└── utils/
    ├── patterns.ts (learning system)
    └── validation.ts
```
