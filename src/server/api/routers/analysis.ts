import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { analyses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Placeholder for AI analysis function
const analyzeWithGemini = async (originalContent: string, feedback: string) => {
  // Mock AI response for now
  return {
    interpretation: "The user wants to make the component more engaging.",
    suggestions: JSON.stringify([
      {
        description: "Add a hover effect to the button.",
        before: "<button>Submit</button>",
        after: "<button className='hover:scale-105'>Submit</button>",
        type: "animation"
      }
    ]),
    confidence: 95,
  };
};

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
      // AI analysis with Gemini
      const aiResponse = await analyzeWithGemini(input.originalContent, input.feedback);
      
      const [analysis] = await ctx.db.insert(analyses).values({
        ...input,
        interpretation: aiResponse.interpretation,
        suggestions: aiResponse.suggestions, // suggestions is already a JSON string
        confidence: aiResponse.confidence,
        userId: ctx.session.user.id,
      }).returning();
      
      return analysis;
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
