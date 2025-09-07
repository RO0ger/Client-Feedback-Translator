import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { analyses } from '@/lib/db/schema';
import { eq, desc, and, ilike, or } from 'drizzle-orm';

export const historyRouter = createTRPCRouter({
  getInfinite: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().uuid().optional(), // Using UUID cursor
    }))
    .query(async ({ input, ctx }) => {
      const items = await ctx.db
        .select({
          id: analyses.id,
          fileName: analyses.fileName,
          feedback: analyses.feedback,
          confidence: analyses.confidence,
          createdAt: analyses.createdAt,
        })
        .from(analyses)
        .where(and(
          eq(analyses.userId, ctx.session.user.id),
          eq(analyses.isDeleted, false)
        ))
        .orderBy(desc(analyses.createdAt))
        .limit(input.limit + 1)
        // Cursor logic will be added if input.cursor is present
        // For now, it fetches from the beginning
        
      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return { items, nextCursor };
    }),

  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input, ctx }) => {
      return await ctx.db
        .select({
          id: analyses.id,
          fileName: analyses.fileName,
          feedback: analyses.feedback,
          confidence: analyses.confidence,
          createdAt: analyses.createdAt,
        })
        .from(analyses)
        .where(and(
          eq(analyses.userId, ctx.session.user.id),
          eq(analyses.isDeleted, false),
          or(
            ilike(analyses.fileName, `%${input.query}%`),
            ilike(analyses.feedback, `%${input.query}%`),
            ilike(analyses.interpretation, `%${input.query}%`)
          )
        ))
        .orderBy(desc(analyses.createdAt))
        .limit(input.limit);
    }),
});
