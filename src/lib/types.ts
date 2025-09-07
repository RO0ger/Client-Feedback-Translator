import { z } from 'zod';
import type { Session as NextAuthSession, User as NextAuthUser } from 'next-auth'

declare module 'next-auth' {
  interface Session extends NextAuthSession {
    user?: {
      id: string
    } & NextAuthSession['user']
  }

  interface User extends NextAuthUser {
    id: string
  }
}

export interface ParsedComponent {
  componentName: string;
  props: any[];
  styling: Record<string, any>;
  structure: Record<string, any>;
  imports: any[];
}

export const changeSchema = z.object({
  type: z.enum(['css', 'props', 'structure', 'animation']),
  before: z.string(),
  after: z.string(),
  explanation: z.string(),
});

// Schema for the raw response from the Gemini API
export const aiTranslationResponseSchema = z.object({
  interpretation: z.string(),
  actionable_changes: z.array(changeSchema),
  external_dependencies_noted: z.array(z.string()).optional(),
  parent_component_changes_noted: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

// Schema for the response sent from our API to the frontend
export const translationResponseSchema = aiTranslationResponseSchema.extend({
  id: z.string().uuid().optional(),
});


export type Change = z.infer<typeof changeSchema>;
export type AiTranslateResponse = z.infer<typeof aiTranslationResponseSchema>;
export type TranslateResponse = z.infer<typeof translationResponseSchema>;

export interface Translation {
    id: string;
    original_feedback: string;
    component_code: string;
    component_name: string | null;
    generated_changes: TranslateResponse['actionable_changes'];
    confidence_score: number | null;
    user_rating: number | null;
    created_at: string;
}
