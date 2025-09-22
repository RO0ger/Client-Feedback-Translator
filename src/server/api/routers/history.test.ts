import { describe, it, expect, vi, beforeEach } from 'vitest'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/context'
import { db } from '@/lib/db'
import { TRPCError } from '@trpc/server'
import { analyses } from '@/lib/db/schema'
import { auth } from '@/auth'
import crypto from 'crypto'

vi.mock('@/lib/db')
vi.mock('@/auth')

const mockSession = {
  user: { id: crypto.randomUUID(), email: 'test@example.com' },
  expires: new Date().toISOString(),
}

describe('History Router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue(mockSession as any)
    
    const ctx = await createTRPCContext({ headers: new Headers() })
    caller = appRouter.createCaller(ctx)
  })

  describe('getInfinite', () => {
    it('should return a list of analyses for the user', async () => {
      const mockAnalyses = [{ id: crypto.randomUUID(), createdAt: new Date() }, { id: crypto.randomUUID(), createdAt: new Date() }]
      
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockAnalyses),
      } as any)

      const result = await caller.history.getInfinite({ limit: 2 })
      expect(result.items.length).toBe(2)
    })

    it('should handle pagination correctly', async () => {
       const mockAnalyses = [
        { id: crypto.randomUUID(), createdAt: new Date(2023, 1, 3) },
        { id: crypto.randomUUID(), createdAt: new Date(2023, 1, 2) },
        { id: crypto.randomUUID(), createdAt: new Date(2023, 1, 1) },
      ]
      
      // First page
       vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValueOnce([...mockAnalyses]), // Return all 3 to simulate hasNextPage
      } as any)

      const firstPage = await caller.history.getInfinite({ limit: 2 })
      expect(firstPage.items.length).toBe(2)
      expect(firstPage.nextCursor).toBe(mockAnalyses[2].id)

      // Second page
      vi.mocked(db.select).mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValueOnce([{ createdAt: mockAnalyses[2].createdAt }]), // for cursor query
      } as any).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(), // This where will be for the main query
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValueOnce([{ id: mockAnalyses[2].id, createdAt: mockAnalyses[2].createdAt }]),
      } as any)
      
      const secondPage = await caller.history.getInfinite({ limit: 2, cursor: mockAnalyses[1].id })
      expect(secondPage.items.length).toBe(1)
      expect(secondPage.nextCursor).toBeUndefined()
    })
  })
  
  describe('search', () => {
    it('should return search results', async () => {
       const mockSearchResults = [{ id: crypto.randomUUID(), fileName: 'test-query-file' }]
       vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockSearchResults),
      } as any)

      const result = await caller.history.search({ query: 'test-query' })
      expect(result.length).toBe(1)
      expect(result[0].fileName).toContain('test-query')
    })
  })

  describe('delete', () => {
    it('should soft delete an analysis', async () => {
      const idToDelete = crypto.randomUUID()
       vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: idToDelete }]),
      } as any)
      
      const result = await caller.history.delete({ id: idToDelete })
      expect(result.success).toBe(true)
      expect(result.id).toBe(idToDelete)
    })

    it('should throw NOT_FOUND when trying to delete non-existent analysis', async () => {
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]), // Nothing returned
      } as any)

      await expect(caller.history.delete({ id: crypto.randomUUID() })).rejects.toThrowError(
        'Analysis not found or you do not have permission to delete it.'
      )
    })
  })
})
