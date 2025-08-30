# 🚀 Client Feedback Translator

## Project Overview

The Client Feedback Translator is a cutting-edge web application designed to help developers and product managers quickly process and understand client feedback. Leveraging advanced AI, specifically **Gemini 2.5 Flash**, it translates raw, often unstructured, client comments into actionable technical changes for code components. This tool streamlines the feedback loop, ensuring clarity and efficiency in development cycles.

## ✨ Features

*   **AI-Powered Feedback Interpretation**: Translates natural language client feedback into precise, actionable code changes.
*   **Code Component Analysis**: Understands and analyzes React (functional and class components), Tailwind CSS, inline styles, CSS Modules, and Styled Components.
*   **Interactive Code Comparison**: Displays `before` and `after` code snippets for proposed changes, aiding review.
*   **Feedback History**: Stores a history of translations, allowing users to revisit past feedback and generated solutions.
*   **User Rating System**: Allows users to rate the quality of AI-generated translations, improving future iterations.
*   **Secure File Uploads**: Supports `.jsx` and `.tsx` file uploads with robust validation and security measures.
*   **Responsive UI**: Built with `shadcn/ui` and `Tailwind CSS v4` for a modern, mobile-first experience.

## 🛠️ Tech Stack

This project is built with the latest stable technologies as of August 2025:

*   **Frontend**:
    *   **Next.js 15** (App Router)
    *   **React 19**
    *   **TypeScript 5.5+**
    *   **Tailwind CSS v4**
    *   **shadcn/ui** (Component Library)
*   **Backend / AI**:
    *   **Node.js 20+**
    *   **Gemini 2.5 Flash** (via `@google/generative-ai` SDK)
*   **Database**:
    *   **Supabase** (Latest 2025 version, 2.45.0+)
*   **Development Tools**:
    *   ESLint, Prettier
    *   Zod (for runtime validation)

## 📁 Project Structure

```
client-feedback-translator/
├── app/                  # Next.js App Router: pages, layouts, API routes
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── api/              # API Routes
│       ├── translate/route.ts       # Main translation API
│       └── translations/route.ts    # History and rating API
├── components/           # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── FileUpload.tsx    # Component for handling file uploads
│   ├── FeedbackInput.tsx # Component for inputting feedback
│   ├── ResultsDisplay.tsx# Displays AI-generated results
│   └── CodeComparison.tsx# Shows before/after code differences
├── lib/                  # Utility functions and configurations
│   ├── supabase.ts       # Supabase client setup
│   ├── gemini.ts         # Gemini AI client setup
│   ├── parser.ts         # Code parsing logic
│   └── types.ts          # TypeScript type definitions
└── utils/                # General utilities
    ├── validation.ts     # Zod schemas for validation
    └── cn.ts             # Tailwind CSS class merging utility
```

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

*   Node.js 20+
*   npm or yarn (npm is recommended)
*   A Google Cloud project with the Gemini API enabled and an API Key.
*   A Supabase project with its URL and Anon Key.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/client-feedback-translator.git
cd client-feedback-translator
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder values with your actual Supabase and Gemini API keys.

### 4. Database Setup (Supabase)

Ensure your Supabase project has the `translations` table set up with the following schema:

```sql
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_feedback TEXT NOT NULL,
  component_code TEXT NOT NULL,
  generated_changes JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  user_rating INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_translations_created_at ON translations(created_at DESC);
CREATE INDEX idx_translations_confidence ON translations(confidence_score DESC);
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🌐 API Endpoints

The application exposes the following API endpoints:

*   **`POST /api/translate`**:
    *   **Description**: Processes client feedback and component code to generate AI-driven changes.
    *   **Request Body**:
        ```json
        {
          "feedback": "string (min: 1, max: 500)",
          "componentCode": "string (min: 1, max: 50000)"
        }
        ```
    *   **Response**: Returns a JSON object with `success: true` and `data` containing the AI's interpretation and proposed changes, or an error.
    *   **Expected AI Response Structure**:
        ```typescript
        interface AIResponse {
          interpretation: string;
          changes: {
            type: 'css' | 'props' | 'structure' | 'animation';
            before: string;
            after: string;
            explanation: string;
          }[];
          confidence: number; // 0.0 - 1.0
          reasoning: string;
        }
        ```
*   **`GET /api/translations`**:
    *   **Description**: Retrieves a list of all past translation entries.
*   **`POST /api/translations/[id]/rating`**:
    *   **Description**: Allows users to rate a specific translation.
    *   **Request Body**:
        ```json
        {
          "rating": "integer (1-5)"
        }
        ```

## 🤝 Contributing

We welcome contributions! Please follow these steps to contribute:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code adheres to the project's [Development Rules](temp_docs/rules.mdc) (e.g., TypeScript strict mode, ESLint, Prettier, unit tests).

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

Made with ❤️ by Nasif
