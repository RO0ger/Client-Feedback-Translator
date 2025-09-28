import { db } from '@/lib/db';
import { analyses } from '@/lib/db/schema';
import { translateFeedback } from '@/lib/gemini';
import { eq } from 'drizzle-orm';

interface ProcessAnalysisParams {
  analysisId: string;
  userId: string;
  fileName: string;
  originalContent: string;
  feedback: string;
}

/**
 * Processes analysis immediately in development mode
 * Simulates the background processing that would normally happen via Inngest
 */
export async function processAnalysisInDevelopment(params: ProcessAnalysisParams) {
  const { analysisId, fileName, originalContent, feedback } = params;

  try {
    // Update status to PROCESSING
    await db
      .update(analyses)
      .set({
        status: 'PROCESSING',
        updatedAt: new Date(),
      })
      .where(eq(analyses.id, analysisId));

    console.log('📊 Development mode: Updated status to PROCESSING', { analysisId });

    // Process with AI (same logic as the Inngest function)
    const aiResponse = await translateFeedback(fileName, originalContent, feedback);

    // Update analysis with results
    await db
      .update(analyses)
      .set({
        interpretation: aiResponse.interpretation,
        suggestions: JSON.stringify(aiResponse.actionable_changes),
        confidence: Math.round(aiResponse.confidence * 100),
        reasoning: aiResponse.reasoning,
        status: 'COMPLETE',
        updatedAt: new Date(),
      })
      .where(eq(analyses.id, analysisId));

    console.log('✅ Development mode: Analysis processing completed', {
      analysisId,
      confidenceScore: aiResponse.confidence,
      suggestionsCount: aiResponse.actionable_changes.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Development mode: Analysis processing failed', {
      analysisId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    // Update status to FAILED
    await db
      .update(analyses)
      .set({
        status: 'FAILED',
        updatedAt: new Date(),
      })
      .where(eq(analyses.id, analysisId));
  }
}
