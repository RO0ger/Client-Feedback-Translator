import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { AiTranslateResponse, aiTranslationResponseSchema } from '@/types';

// --- Zod Schemas for robust type-checking and validation ---

// Schema for the output of our first AI call (Step 1: Planning)
const aiPlanSchema = z.object({
  interpretation: z.string(),
  reasoning: z.string(),
  change_plan: z.array(z.object({
    element_to_change: z.string(),
    change_required: z.string(),
  })),
  confidence: z.number().min(0).max(1),
});
type AiPlan = z.infer<typeof aiPlanSchema>;

// Schema for the output of our second AI call (Step 2: Code Generation)
const aiCodeGenerationSchema = z.object({
  actionable_changes: z.array(z.object({
    type: z.enum(['css', 'props', 'structure', 'animation']),
    before: z.string(),
    after: z.string(),
    explanation: z.string(),
  })),
  external_dependencies_noted: z.array(z.string()).optional(),
  parent_component_changes_noted: z.array(z.string()).optional(),
});

// Constants
const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;

// Input validation schemas
const translateFeedbackInputSchema = z.object({
  componentName: z.string().min(1, "Component name is required").max(100, "Component name too long"),
  componentCode: z.string().min(10, "Component code too short").max(50000, "Component code too long"),
  feedback: z.string().min(5, "Feedback too short").max(1000, "Feedback too long"),
});

const extractPatternInputSchema = z.object({
  feedback: z.string().min(3, "Feedback too short").max(500, "Feedback too long"),
});

// Prompt templates
const INTERPRETATION_PROMPT_TEMPLATE = `
    ROLE: You are an expert Frontend Code Reviewer.
    TASK: Analyze the client feedback in the context of the provided React component. Your goal is to understand the user's intent and create a high-level plan for the required code changes. Do not write or generate any code yourself.

    CONTEXT:
    - Component Name: {componentName}

    <component_code>
    {componentCode}
    </component_code>

    <client_feedback>
    "{feedback}"
    </client_feedback>

    OUTPUT FORMAT (MUST be valid JSON):
    {
      "interpretation": "A technical summary of what the client wants.",
      "reasoning": "A high-level explanation of why the proposed changes will address the feedback.",
      "change_plan": [
        {
          "element_to_change": "A description of the JSX element or code block to modify, e.g., 'The main button element'.",
          "change_required": "A clear instruction for the change, e.g., 'Add a hover animation to increase visual feedback.' or 'Increase the top padding from p-4 to p-6.'"
        }
      ],
      "confidence": 0.0 to 1.0
    }
  `;

const CODE_GENERATION_PROMPT_TEMPLATE = `
    ROLE: You are a Senior Frontend Developer specializing in React and Tailwind CSS.
    TASK: Execute the following change plan on the provided component code. Your goal is to generate only the specific code changes required.

    <component_code>
    {componentCode}
    </component_code>

    <change_plan>
    {changePlan}
    </change_plan>

    OUTPUT FORMAT (MUST be valid JSON):
    {
      "actionable_changes": [
        {
          "type": "css|props|structure|animation",
          "before": "The exact original code snippet to be replaced. Must be a character-for-character match from the component code.",
          "after": "The new code snippet to replace the original.",
          "explanation": "A concise technical reason for this specific change, derived from the plan."
        }
      ],
      "external_dependencies_noted": ["List any new libraries needed, e.g., 'framer-motion'"],
      "parent_component_changes_noted": ["List any required changes in the parent component, e.g., 'The parent must now pass a 'variant' prop.'"]
    }
  `;

const PATTERN_EXTRACTION_PROMPT_TEMPLATE = `
    ROLE: You are a highly efficient text analysis API.
    TASK: Analyze the user feedback and distill its core intent into a concise, standardized "pattern" phrase. Then, classify it.

    EXAMPLES:
    - Feedback: "it just doesn't pop" -> {"pattern": "Enhance visual impact", "category": "Style"}
    - Feedback: "feels a bit cramped" -> {"pattern": "Increase spacing/padding", "category": "Layout"}
    - Feedback: "where do I click?" -> {"pattern": "Improve call-to-action clarity", "category": "UX"}

    USER FEEDBACK: "{feedback}"

    OUTPUT: Your response must be a single, minified JSON object matching this schema: { "pattern": string, "category": "Style"|"Layout"|"Functionality"|"Copywriting"|"UX" }. Do not include any other text.
  `;

/**
 * Sanitizes input strings for use in AI prompts
 * Prevents issues with special characters and ensures safe template substitution
 * @param input - The string to sanitize
 * @returns Sanitized string safe for use in prompts
 */
function sanitizeForPrompt(input: string): string {
  return input
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/"/g, '\\"')    // Escape quotes
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\r/g, '\\r')   // Escape carriage returns
    .replace(/\t/g, '\\t')   // Escape tabs
    .replace(/\{/g, '\\{')   // Escape template braces
    .replace(/\}/g, '\\}')   // Escape template braces
    .trim();                 // Remove leading/trailing whitespace
}

// --- Gemini API Configuration ---

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

/**
 * Custom error class for Gemini API related errors
 * Provides better error tracking and debugging capabilities
 */
export class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

/**
 * Retry utility with exponential backoff for API calls
 * Implements resilient error handling with jitter to prevent thundering herd
 * @param fn - The async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds before first retry (default: 1000)
 * @returns Promise that resolves with the function result or rejects after all retries
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = BASE_RETRY_DELAY
): Promise<T> {
  let lastError: Error = new Error("No attempts made");

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`API call failed, retrying in ${Math.round(delay)}ms... (Attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new GeminiError(`Failed after ${maxRetries + 1} attempts. Last error: ${lastError.message}`);
}

// --- Prompt Engineering Functions ---

function buildInterpretationPrompt(componentName: string, componentCode: string, feedback: string): string {
  return INTERPRETATION_PROMPT_TEMPLATE
    .replace('{componentName}', sanitizeForPrompt(componentName || 'Unnamed Component'))
    .replace('{componentCode}', sanitizeForPrompt(componentCode))
    .replace('{feedback}', sanitizeForPrompt(feedback));
}

function buildCodeGenerationPrompt(componentCode: string, plan: AiPlan): string {
  return CODE_GENERATION_PROMPT_TEMPLATE
    .replace('{componentCode}', sanitizeForPrompt(componentCode))
    .replace('{changePlan}', JSON.stringify(plan.change_plan, null, 2));
}


/**
 * Translates client feedback into actionable code changes using a two-step AI chain
 *
 * This function implements a sophisticated approach:
 * 1. **Interpretation Phase**: Analyzes feedback and creates a high-level change plan
 * 2. **Code Generation Phase**: Executes the plan to generate specific code changes
 *
 * The two-step approach ensures more reliable and structured AI responses by
 * separating "thinking" from "doing".
 *
 * @param componentName - Name of the React component being modified
 * @param componentCode - The current source code of the component
 * @param feedback - Client feedback describing desired changes
 * @returns Promise<AiTranslateResponse> - Structured response with interpretation, changes, and metadata
 * @throws {GeminiError} - When AI processing fails after retries
 *
 * @example
 * ```typescript
 * const result = await translateFeedback(
 *   'UserProfileCard',
 *   '<div className="p-4">...</div>',
 *   'Make it more visually appealing'
 * );
 * console.log(result.actionable_changes); // Array of specific code changes
 * ```
 */
export async function translateFeedback(
  componentName: string,
  componentCode: string,
  feedback: string
): Promise<AiTranslateResponse> {
  // Validate inputs
  const validatedInput = translateFeedbackInputSchema.parse({
    componentName,
    componentCode,
    feedback
  });

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json", // Crucial for reliability
    },
  });

  try {
    // === STEP 1: Interpretation & Planning ===
    console.log("Initiating Step 1: Interpretation...");
    const interpretationPrompt = buildInterpretationPrompt(validatedInput.componentName, validatedInput.componentCode, validatedInput.feedback);
    const interpretationResult = await retryWithBackoff(async () => {
      return await model.generateContent(interpretationPrompt);
    });
    const planResponseText = interpretationResult.response.text();
    const plan = aiPlanSchema.parse(JSON.parse(planResponseText));
    console.log("Step 1 Complete. Plan generated:", plan);

    // === STEP 2: Code Generation ===
    console.log("Initiating Step 2: Code Generation...");
    const codeGenPrompt = buildCodeGenerationPrompt(validatedInput.componentCode, plan);
    const codeGenResult = await retryWithBackoff(async () => {
      return await model.generateContent(codeGenPrompt);
    });
    const codeGenResponseText = codeGenResult.response.text();
    const codeChanges = aiCodeGenerationSchema.parse(JSON.parse(codeGenResponseText));
    console.log("Step 2 Complete. Code changes generated:", codeChanges);

    // === STEP 3: Combine and Finalize ===
    const finalResponse: AiTranslateResponse = {
      interpretation: plan.interpretation,
      actionable_changes: codeChanges.actionable_changes,
      external_dependencies_noted: codeChanges.external_dependencies_noted,
      parent_component_changes_noted: codeChanges.parent_component_changes_noted,
      confidence: plan.confidence,
      reasoning: plan.reasoning,
    };

    // Final validation against the primary schema
    return aiTranslationResponseSchema.parse(finalResponse);

  } catch (error) {
    console.error("Gemini API Chain Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during AI translation.";
    throw new GeminiError(`Failed to get a valid response from the AI model. Details: ${errorMessage}`);
  }
}

// --- Pattern Extraction Function (Also Optimized) ---

const patternExtractionSchema = z.object({
  pattern: z.string().max(100),
  category: z.enum(["Style", "Layout", "Functionality", "Copywriting", "UX"]),
});

/**
 * Extracts a standardized pattern from client feedback
 *
 * This function categorizes subjective feedback into predefined patterns
 * and categories to enable better organization and processing of feedback data.
 *
 * Categories include: Style, Layout, Functionality, Copywriting, UX
 *
 * @param feedback - Raw client feedback text
 * @returns Promise<string> - Standardized pattern phrase
 *
 * @example
 * ```typescript
 * const pattern = await extractPatternFromFeedback("it just doesn't pop");
 * console.log(pattern); // "Enhance visual impact"
 * ```
 */
export async function extractPatternFromFeedback(feedback: string): Promise<string> {
  // Validate inputs
  const validatedInput = extractPatternInputSchema.parse({ feedback });

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = PATTERN_EXTRACTION_PROMPT_TEMPLATE.replace('{feedback}', sanitizeForPrompt(validatedInput.feedback));

  try {
    const result = await retryWithBackoff(async () => {
      return await model.generateContent(prompt);
    });
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    const validated = patternExtractionSchema.parse(parsed);
    return validated.pattern;
  } catch (error) {
    console.error("Gemini Pattern Extraction Error:", error);
    // Fallback remains a good safety net
    return validatedInput.feedback.toLowerCase().replace(/\s+/g, ' ').trim();
  }
}