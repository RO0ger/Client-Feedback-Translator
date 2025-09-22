import { supabase } from './supabase';
import { extractPatternFromFeedback } from './gemini';
import type { Change } from '@/types';

/**
 * Updates the feedback_patterns table based on a highly-rated translation.
 * If a pattern exists, it updates its success rate and usage count.
 * If not, it creates a new entry.
 * @param feedback The original user feedback.
 * @param solution The generated changes from the AI.
 */
export async function updatePatterns(feedback: string, solution: Change[]) {
  const pattern = await extractPatternFromFeedback(feedback);

  const { data, error } = await supabase
    .from('feedback_patterns')
    .select('id, success_rate, usage_count')
    .eq('pattern', pattern)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
    console.error('Error fetching feedback pattern:', error);
    return;
  }

  if (data) {
    // Pattern exists, update it
    const newUsageCount = (data.usage_count || 0) + 1;
    // Simple moving average: ((old_avg * old_count) + new_value) / new_count
    // New value is 1 for a successful rating.
    const newSuccessRate = (((data.success_rate || 0) * (data.usage_count || 0)) + 1) / newUsageCount;

    const { error: updateError } = await supabase
      .from('feedback_patterns')
      .update({
        usage_count: newUsageCount,
        success_rate: newSuccessRate,
        common_solutions: solution, // Overwrite with the latest successful solution for simplicity
      })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error updating feedback pattern:', updateError);
    } else {
      console.log(`Pattern "${pattern}" updated successfully.`);
    }
  } else {
    // Pattern does not exist, create it
    const { error: insertError } = await supabase
      .from('feedback_patterns')
      .insert({
        pattern: pattern,
        common_solutions: solution,
        success_rate: 1.00, // First time seen, 100% success rate
        usage_count: 1,
      });

    if (insertError) {
      console.error('Error creating new feedback pattern:', insertError);
    } else {
      console.log(`New pattern "${pattern}" created successfully.`);
    }
  }
}

/**
 * Finds matching patterns in the database for new feedback and suggests changes.
 * This is a placeholder for the suggestion improvement logic.
 * @param feedback The new user feedback.
 * @param component The parsed component data.
 * @returns An array of suggested changes.
 */
export async function getSuggestedChanges(feedback: string, component: any) {
  // This would query the `feedback_patterns` table for similar patterns
  // and adapt the stored solutions to the current component's context.
  return []; // Placeholder return
}
