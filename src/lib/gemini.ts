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

// 10/10 OPTIMIZED PROMPT TEMPLATES
const INTERPRETATION_PROMPT_TEMPLATE = `
You are a top 1% precision code analysis expert. Your ONLY job is to understand client feedback and create an exact implementation plan.

CRITICAL RULES:
1. Follow the client's EXACT request - do not interpret, improve, or suggest alternatives
2. If they say "black", use black (#000000 or text-black), NOT grey
3. If they say specific colors, use those EXACT colors
4. Be literal - don't add your own design opinions

COMPONENT TO ANALYZE:
Component Name: {componentName}

<component_code>
{componentCode}
</component_code>

CLIENT REQUEST:
"{feedback}"

TASK: Create a precise plan that implements EXACTLY what the client asked for.

REQUIRED JSON OUTPUT:
{
  "interpretation": "Restate exactly what the client wants in technical terms",
  "reasoning": "Explain why this exact change addresses their request",
  "change_plan": [
    {
      "element_to_change": "Specific JSX element or CSS class to modify",
      "change_required": "Exact change needed - use client's specified values"
    }
  ],
  "confidence": 0.9
}

EXAMPLES:
- Client says "make font black" → use text-black or #000000, NOT text-gray-900
- Client says "change background to yellow" → use bg-yellow-400 or #FFFF00, NOT bg-yellow-100
- Client says "increase padding" → specify exact padding increase like "p-4 to p-6"

Be precise. Be literal. Follow instructions exactly.
`;

const CODE_GENERATION_PROMPT_TEMPLATE = `
You are a top 1% surgical code editor. Execute the change plan with ZERO deviation.

COMPONENT CODE:
<component_code>
{componentCode}
</component_code>

CHANGE PLAN TO EXECUTE:
<change_plan>
{changePlan}
</change_plan>

CRITICAL EXECUTION RULES:
1. Find the EXACT code snippets that need changing
2. Make ONLY the changes specified in the plan
3. Use EXACT values specified (if plan says "text-black", use "text-black")
4. Match code character-for-character in "before" field
5. No creative additions or "improvements"

REQUIRED JSON OUTPUT:
{
  "actionable_changes": [
    {
      "type": "css|props|structure|animation",
      "before": "EXACT original code snippet (must match character-for-character)",
      "after": "EXACT replacement code with only the specified change",
      "explanation": "Brief explanation of what was changed"
    }
  ],
  "external_dependencies_noted": [],
  "parent_component_changes_noted": []
}

VALIDATION CHECKLIST:
✓ "before" field matches existing code exactly
✓ "after" field contains only the requested change
✓ No additional modifications added
✓ Tailwind classes are valid (text-black, bg-yellow-400, etc.)

Execute the plan precisely. No interpretations. No improvements.
`;

const PATTERN_EXTRACTION_PROMPT_TEMPLATE = `
Extract the core intent from this feedback. Be direct and literal.

FEEDBACK: "{feedback}"

RULES:
- If they mention specific colors/values, that's the pattern
- Don't interpret or improve their request
- Categories: Style, Layout, Functionality, Copywriting, UX

OUTPUT (JSON only):
{ "pattern": "exact intent", "category": "appropriate category" }

EXAMPLES:
- "make it black" → {"pattern": "Change color to black", "category": "Style"}
- "add more padding" → {"pattern": "Increase spacing", "category": "Layout"}
- "button doesn't work" → {"pattern": "Fix functionality", "category": "Functionality"}
`;

/**
 * Sanitizes input strings for use in AI prompts
 * Targets only template literal problematic characters to avoid over-escaping
 * @param input - The string to sanitize
 * @returns Sanitized string safe for template substitution
 */
function sanitizeForPrompt(input: string): string {
  return input
    .replace(/`/g, '\\`')    // Escape backticks (template literal delimiters)
    .replace(/\$/g, '\\$')   // Escape dollar signs (template interpolation)
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .trim();                 // Remove leading/trailing whitespace
}

// --- Gemini API Configuration ---

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

/**
 * Factory function for creating configured Gemini models
 * Ensures consistent JSON response configuration across the application
 * @returns Configured generative model instance
 */
function createJsonModel() {
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
}

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

  const model = createJsonModel();

  try {
    // === STEP 1: Interpretation & Planning ===
    console.log("🤖 STEP 1: Building interpretation prompt...");
    const interpretationPrompt = buildInterpretationPrompt(validatedInput.componentName, validatedInput.componentCode, validatedInput.feedback);
    console.log("🤖 STEP 1: Prompt length:", interpretationPrompt.length);
    console.log("🤖 STEP 1: Making API call to Gemini...");
    const interpretationResult = await retryWithBackoff(async () => {
      return await model.generateContent(interpretationPrompt);
    });
    const planResponseText = interpretationResult.response.text();
    console.log("🤖 STEP 1: Raw API response:", planResponseText.substring(0, 200) + "...");
    const plan = aiPlanSchema.parse(JSON.parse(planResponseText));
    console.log("🤖 STEP 1: Parsed response:", {
      confidence: plan.confidence,
      interpretation: plan.interpretation.substring(0, 100) + "...",
      changesCount: plan.change_plan.length
    });

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

  const model = createJsonModel();

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
    // Return a structured fallback instead of raw text
    return "General feedback";
  }
}