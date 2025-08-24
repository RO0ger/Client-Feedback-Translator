import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { z } from 'zod';
import { AiTranslateResponse, aiTranslationResponseSchema } from './types';

// Zod schema for validating the AI's response
const aiResponseSchema = z.object({
  interpretation: z.string(),
  actionable_changes: z.array(z.object({
    type: z.enum(['css', 'props', 'structure', 'animation']),
    before: z.string(),
    after: z.string(),
    explanation: z.string(),
  })),
  external_dependencies_noted: z.array(z.string()).optional(),
  parent_component_changes_noted: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function buildPrompt(componentName: string | undefined, componentCode: string, feedback: string): string {
  return `
    ROLE: Senior Frontend Developer & Designer

    CONTEXT:
    - Component: ${componentName || 'Unnamed Component'}
    - Current Code:
      \`\`\`tsx
      ${componentCode}
      \`\`\`
    - Client Type: B2B SaaS
    - Design System: Modern, professional, clean aesthetic using Tailwind CSS.

    CLIENT FEEDBACK: "${feedback}"

    TASK: Translate this subjective feedback into specific, actionable code changes for the React component above.

    OUTPUT FORMAT (MUST be valid JSON):
    {
      "interpretation": "A brief summary of what the client likely means, technically.",
      "actionable_changes": [
        {
          "type": "css|props|structure|animation",
          "before": "The exact original code snippet to be replaced.",
          "after": "The new code snippet to replace the original.",
          "explanation": "A concise technical reason for this specific change."
        }
      ],
      "external_dependencies_noted": ["List any new libraries needed, e.g., 'framer-motion'"],
      "parent_component_changes_noted": ["List any required changes in the parent component, e.g., 'The parent must now pass a 'variant' prop.'"],
      "confidence": 0.0 to 1.0,
      "reasoning": "A high-level explanation of why these changes collectively address the client's feedback."
    }

    CONSTRAINTS:
    - Adhere strictly to the JSON output format.
    - Analyze the provided code and feedback carefully.
    - Generate changes that are practical and maintain the component's existing functionality.
    - Use modern React (Hooks) and Tailwind CSS v4 patterns.
    - Ensure code snippets in 'before' and 'after' are well-formed and directly implementable.
    - The 'before' snippet must exist in the original code.
  `;
}

export class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

export async function translateFeedback(
  componentName: string,
  componentCode: string,
  feedback: string
): Promise<AiTranslateResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    ROLE: Senior Frontend Developer & Designer

    CONTEXT:
    - Component: ${componentName || 'Unnamed Component'}
    - Current Code:
      \`\`\`tsx
      ${componentCode}
      \`\`\`
    - Client Type: B2B SaaS
    - Design System: Modern, professional, clean aesthetic using Tailwind CSS.

    CLIENT FEEDBACK: "${feedback}"

    TASK: Translate this subjective feedback into specific, actionable code changes for the React component above.

    OUTPUT FORMAT (MUST be valid JSON):
    {
      "interpretation": "A brief summary of what the client likely means, technically.",
      "actionable_changes": [
        {
          "type": "css|props|structure|animation",
          "before": "The exact original code snippet to be replaced.",
          "after": "The new code snippet to replace the original.",
          "explanation": "A concise technical reason for this specific change."
        }
      ],
      "external_dependencies_noted": ["List any new libraries needed, e.g., 'framer-motion'"],
      "parent_component_changes_noted": ["List any required changes in the parent component, e.g., 'The parent must now pass a 'variant' prop.'"],
      "confidence": 0.0 to 1.0,
      "reasoning": "Why these changes address the feedback"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean the response to ensure it's valid JSON
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(cleanedJson);
    const validatedResponse = aiTranslationResponseSchema.parse(parsed);

    return validatedResponse;
  } catch (error) {
     console.error("Gemini API Error:", error);
     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during AI translation.";
     throw new GeminiError(`Failed to get a valid response from the AI model. Details: ${errorMessage}`);
  }
}

const patternExtractionSchema = z.object({
  pattern: z.string().max(100),
  category: z.enum(["Style", "Layout", "Functionality", "Copywriting", "UX"]),
});

export async function extractPatternFromFeedback(feedback: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    ROLE: API Endpoint for Text Categorization

    TASK: Analyze the user's subjective design feedback and distill it into a concise, standardized "pattern" that captures the core intent. The pattern should be a short phrase. Also, classify the feedback into one of the predefined categories.

    EXAMPLES:
    - Feedback: "it just doesn't pop" -> Pattern: "Enhance visual impact", Category: "Style"
    - Feedback: "feels a bit cramped" -> Pattern: "Increase spacing/padding", Category: "Layout"
    - Feedback: "where do I click?" -> Pattern: "Improve call-to-action clarity", Category: "UX"
    - Feedback: "make it look more professional and trustworthy" -> Pattern: "Refine professional aesthetic", Category: "Style"
    - Feedback: "the text is hard to read" -> Pattern: "Improve text readability", Category: "Copywriting"

    USER FEEDBACK: "${feedback}"

    OUTPUT FORMAT (MUST be valid JSON):
    {
      "pattern": "A short, standardized phrase for the feedback's core intent.",
      "category": "One of: Style, Layout, Functionality, Copywriting, UX"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    const validated = patternExtractionSchema.parse(parsed);
    return validated.pattern;
  } catch (error) {
    console.error("Gemini Pattern Extraction Error:", error);
    // Fallback to a simple normalization if AI fails
    return feedback.toLowerCase().replace(/\s+/g, ' ').trim();
  }
}
