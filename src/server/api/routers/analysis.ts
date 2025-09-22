import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { analyses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { translateFeedback } from '@/lib/gemini';
import { inngest } from '@/lib/inngest';

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
        // Create analysis record immediately with PENDING status
        const [analysis] = await ctx.db.insert(analyses).values({
          ...input,
          status: 'PENDING',
          userId: ctx.session.user.id,
        }).returning();

        // Send to Inngest for background processing
        await inngest.send({
          name: 'analysis/process',
          data: {
            analysisId: analysis.id,
            userId: ctx.session.user.id,
            fileName: input.fileName,
            originalContent: input.originalContent,
            feedback: input.feedback,
          },
        });

        // Log on Success (immediate creation)
        const latency = Date.now() - startTime;
        console.log('✅ Analysis record created and queued for processing', {
          analysisId: analysis.id,
          userId: ctx.session.user.id,
          status: 'PENDING',
          latencyMs: latency,
          timestamp: new Date().toISOString(),
        });

        return {
          ...analysis,
          suggestions: null, // No suggestions yet, will be populated by background worker
        };
      } catch (error) {
        // Log on Failure
        const latency = Date.now() - startTime;
        console.error('❌ Analysis creation failed', {
          userId: ctx.session.user.id,
          fileName: input.fileName,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          latencyMs: latency,
          timestamp: new Date().toISOString(),
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create analysis. Please try again.',
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
        suggestions: analysis.suggestions ? JSON.parse(analysis.suggestions) : null,
      };
    }),

  getStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const [analysis] = await ctx.db.select({
        id: analyses.id,
        status: analyses.status,
        updatedAt: analyses.updatedAt,
        createdAt: analyses.createdAt,
      })
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
        id: analysis.id,
        status: analysis.status,
        isComplete: analysis.status === 'COMPLETE',
        isFailed: analysis.status === 'FAILED',
        isPending: analysis.status === 'PENDING',
        isProcessing: analysis.status === 'PROCESSING',
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      };
    }),
});
