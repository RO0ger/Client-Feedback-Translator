import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { updatePatterns } from '@/lib/patterns';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const translationId = params.id;
    if (!translationId) {
      return NextResponse.json({ error: "Translation ID is required" }, { status: 400 });
    }
    
    const body = await request.json();

    const schema = z.object({
      rating: z.number().int().min(1).max(5),
    });

    const validated = schema.parse(body);

    // Step 1: Update the rating in the 'translations' table
    const { data: translation, error: updateError } = await supabase
      .from('translations')
      .update({ user_rating: validated.rating })
      .eq('id', translationId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase rating update error:', updateError);
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: "Translation not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to update rating", details: updateError.message }, { status: 500 });
    }

    // Step 2: If rating is high, trigger the learning system
    if (validated.rating >= 4) {
      if (translation && translation.original_feedback && translation.generated_changes) {
        // Run this asynchronously; we don't need to wait for it to finish
        updatePatterns(translation.original_feedback, translation.generated_changes)
          .catch(err => console.error("Failed to update patterns asynchronously:", err));
      }
    }

    return NextResponse.json({ success: true, message: 'Rating updated successfully.' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid rating data", details: error.errors }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred";
    console.error("API Error in rating route:", error);
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
