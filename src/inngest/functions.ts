import { inngest } from '@/lib/inngest';
import { db } from '@/lib/db';
import { analyses } from '@/lib/db/schema';
import { translateFeedback } from '@/lib/gemini';
import { eq } from 'drizzle-orm';

// Inngest function to process AI analysis in the background
export const processAnalysis = inngest.createFunction(
  { id: 'process-analysis' },
  { event: 'analysis/process' },
  async ({ event, step }) => {
    const { analysisId } = event.data;

    // Step 1: Update status to PROCESSING
    await step.run('update-status-processing', async () => {
      await db
        .update(analyses)
        .set({
          status: 'PROCESSING',
          updatedAt: new Date(),
        })
        .where(eq(analyses.id, analysisId));

      console.log('📊 Analysis status updated to PROCESSING', {
        analysisId,
        timestamp: new Date().toISOString(),
      });
    });

    // Step 2: Get the analysis data
    const analysis = await step.run('get-analysis-data', async () => {
      const [result] = await db
        .select()
        .from(analyses)
        .where(eq(analyses.id, analysisId))
        .limit(1);

      if (!result) {
        throw new Error(`Analysis ${analysisId} not found`);
      }

      return result;
    });

    // Step 3: Process with AI
    const aiResponse = await step.run('process-with-ai', async () => {
      return await translateFeedback(
        analysis.fileName,
        analysis.originalContent,
        analysis.feedback
      );
    });

    // Step 4: Update analysis with results
    await step.run('update-analysis-results', async () => {
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

      console.log('✅ Analysis processing completed', {
        analysisId,
        confidenceScore: aiResponse.confidence,
        suggestionsCount: aiResponse.actionable_changes.length,
        timestamp: new Date().toISOString(),
      });
    });

    return {
      analysisId,
      status: 'COMPLETE',
      confidence: aiResponse.confidence,
      suggestionsCount: aiResponse.actionable_changes.length,
    };
  }
);

// Inngest function to handle failures and retry logic
export const handleAnalysisFailure = inngest.createFunction(
  { id: 'handle-analysis-failure' },
  { event: 'analysis/failed' },
  async ({ event, step }) => {
    const { analysisId, error } = event.data;

    await step.run('update-status-failed', async () => {
      await db
        .update(analyses)
        .set({
          status: 'FAILED',
          updatedAt: new Date(),
        })
        .where(eq(analyses.id, analysisId));

      console.error('❌ Analysis processing failed', {
        analysisId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    });

    return {
      analysisId,
      status: 'FAILED',
      error: error.message,
    };
  }
);
