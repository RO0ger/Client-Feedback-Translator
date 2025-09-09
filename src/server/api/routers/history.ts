import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { analyses } from '@/lib/db/schema';
import { eq, desc, and, ilike, or, lt } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const historyRouter = createTRPCRouter({
  getInfinite: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().uuid().optional(), // Using UUID cursor
    }))
    .query(async ({ input, ctx }) => {
      const { limit, cursor } = input;

      const cursorQuery = cursor
        ? ctx.db.select({ createdAt: analyses.createdAt }).from(analyses).where(eq(analyses.id, cursor))
        : Promise.resolve([]);

      const [cursorItem] = await cursorQuery;

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
          eq(analyses.isDeleted, false),
          cursorItem ? lt(analyses.createdAt, cursorItem.createdAt) : undefined
        ))
        .orderBy(desc(analyses.createdAt))
        .limit(limit + 1);
        
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
    
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const [deletedAnalysis] = await ctx.db
        .update(analyses)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
        })
        .where(
          and(
            eq(analyses.id, input.id),
            eq(analyses.userId, ctx.session.user.id)
          )
        )
        .returning({ id: analyses.id });

      if (!deletedAnalysis) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Analysis not found or you do not have permission to delete it.',
        });
      }

      return { success: true, id: deletedAnalysis.id };
    }),
});
