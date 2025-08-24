import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('translations')
      .select('id, component_name, original_feedback, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch translation history.', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown internal error occurred';
    console.error('API Error:', error);
    return NextResponse.json({ error: 'An internal error occurred.', details: errorMessage }, { status: 500 });
  }
}
