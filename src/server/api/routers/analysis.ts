import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { analyses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { translateFeedback } from '@/lib/gemini';

const createAnalysisSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().min(1),
  originalContent: z.string().min(1),
  feedback: z.string().min(1),
});

export const analysisRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createAnalysisSchema)
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();

      // Log on Entry
      console.log('🚀 AI Analysis initiated', {
        userId: ctx.session.user.id,
        fileName: input.fileName,
        codeLength: input.originalContent.length,
        feedbackLength: input.feedback.length,
        timestamp: new Date().toISOString(),
      });

      try {
        // AI analysis with Gemini
        const aiResponse = await translateFeedback(
          input.fileName,
          input.originalContent,
          input.feedback
        );

        const [analysis] = await ctx.db.insert(analyses).values({
          ...input,
          interpretation: aiResponse.interpretation,
          suggestions: JSON.stringify(aiResponse.actionable_changes), // Convert array to JSON string
          confidence: Math.round(aiResponse.confidence * 100), // Convert 0-1 to 0-100
          reasoning: aiResponse.reasoning,
          userId: ctx.session.user.id,
        }).returning();

        // Log on Success
        const latency = Date.now() - startTime;
        console.log('✅ AI Analysis completed successfully', {
          analysisId: analysis.id,
          userId: ctx.session.user.id,
          confidenceScore: aiResponse.confidence,
          suggestionsCount: aiResponse.actionable_changes.length,
          latencyMs: latency,
          timestamp: new Date().toISOString(),
        });

        return analysis;
      } catch (error) {
        // Log on Failure
        const latency = Date.now() - startTime;
        console.error('❌ AI Analysis failed', {
          userId: ctx.session.user.id,
          fileName: input.fileName,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          latencyMs: latency,
          timestamp: new Date().toISOString(),
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze component. Please try again.',
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const [analysis] = await ctx.db.select()
        .from(analyses)
        .where(and(
          eq(analyses.id, input.id),
          eq(analyses.userId, ctx.session.user.id),
          eq(analyses.isDeleted, false)
        ))
        .limit(1);
      
      if (!analysis) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      
      return {
        ...analysis,
        suggestions: JSON.parse(analysis.suggestions),
      };
    }),
});
