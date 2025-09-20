import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseComponent } from '@/lib/parser';
import { translateFeedback, GeminiError } from '@/lib/gemini';
import { ParserError } from '@/lib/parser';
import { supabase } from '@/lib/supabase';
import { AiTranslateResponse, TranslateResponse } from '@/lib/types';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();

    const schema = z.object({
      feedback: z.string().min(1).max(1000),
      componentCode: z.string().min(1).max(50000),
    });

    const validated = schema.parse(body);
    
    let parsedComponent;
    try {
      parsedComponent = parseComponent(validated.componentCode);
    } catch (error) {
      if (error instanceof ParserError) {
        return NextResponse.json({ error: "Failed to parse component", details: error.message }, { status: 400 });
      }
      // Re-throw other unexpected errors
      throw error;
    }

    try {
      const aiResponse: AiTranslateResponse = await translateFeedback(
        parsedComponent.componentName,
        validated.componentCode,
        validated.feedback
      );

      // Save to Supabase and get the ID
      const { data, error: dbError } = await supabase
        .from('translations')
        .insert([
          {
            original_feedback: validated.feedback,
            component_code: validated.componentCode,
            component_name: parsedComponent.componentName,
            generated_changes: aiResponse.actionable_changes,
            confidence_score: aiResponse.confidence,
            user_id: userId,
          },
        ])
        .select('id')
        .single();

      if (dbError || !data) {
        console.error('Supabase error:', dbError);
        // Still return the AI response to the user even if DB save fails
        return NextResponse.json(aiResponse);
      }
      
      const responseWithId: TranslateResponse = {
        ...aiResponse,
        id: data.id,
      };

      return NextResponse.json(responseWithId);
    } catch (error) {
      if (error instanceof GeminiError) {
         return NextResponse.json({ error: "AI translation failed", details: error.message }, { status: 502 }); // Bad Gateway
      }
      // Re-throw other unexpected errors
      throw error;
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred";
    console.error("API Error:", error);
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
