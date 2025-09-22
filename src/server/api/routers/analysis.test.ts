import { describe, it, expect, vi, beforeEach } from 'vitest'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/context'
import { db } from '@/lib/db'
import type { inferProcedureInput } from '@trpc/server'
import { TRPCError } from '@trpc/server'
import { auth } from '@/auth'
import crypto from 'crypto'

vi.mock('@/lib/db')
vi.mock('@/auth')

// Mock the AI function
vi.mock('@/lib/gemini', () => ({
  translateFeedback: vi.fn().mockResolvedValue({
    interpretation: 'Test interpretation',
    suggestions: [
      {
        description: 'Test suggestion',
        before: '<code>before</code>',
        after: '<code>after</code>',
        type: 'css',
      },
    ],
    confidence: 0.9,
  }),
}))

const mockSession = {
  user: { id: crypto.randomUUID(), email: 'test@example.com' },
  expires: new Date().toISOString(),
}

describe('Analysis Router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>

  beforeEach(async () => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Mock authenticated session
    vi.mocked(auth).mockResolvedValue(mockSession as any)
    
    const ctx = await createTRPCContext({ headers: new Headers() })
    caller = appRouter.createCaller(ctx)
  })

  describe('create analysis', () => {
    it('should successfully create an analysis for an authenticated user', async () => {
      const input: inferProcedureInput<typeof appRouter.analysis.create> = {
        fileName: 'test.tsx',
        fileSize: 123,
        originalContent: 'const a = 1;',
        feedback: 'make it better',
      }

      const mockAnalysis = { ...input, id: crypto.randomUUID(), userId: mockSession.user.id, interpretation: 'Test interpretation', suggestions: '[]', confidence: 90 }
      
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAnalysis]),
        }),
      } as any)

      const result = await caller.analysis.create(input)

      expect(result).toEqual(mockAnalysis)
      expect(db.insert).toHaveBeenCalledWith(expect.any(Object)) // Can't test schema object directly
    })

    it('should throw UNAUTHORIZED error if user is not authenticated', async () => {
      // Mock unauthenticated session
      vi.mocked(auth).mockResolvedValue(null)
      
      const ctx = await createTRPCContext({ headers: new Headers() })
      const unauthedCaller = appRouter.createCaller(ctx)

      const input: inferProcedureInput<typeof appRouter.analysis.create> = {
        fileName: 'test.tsx',
        fileSize: 123,
        originalContent: 'const a = 1;',
        feedback: 'make it better',
      }
      
      await expect(unauthedCaller.analysis.create(input)).rejects.toThrow(TRPCError)
    })

     it('should throw a validation error for invalid input', async () => {
      const input = {
        fileName: '', // Invalid
        fileSize: 123,
        originalContent: 'const a = 1;',
        feedback: 'make it better',
      }

      await expect(caller.analysis.create(input as any)).rejects.toThrow()
    })
  })

  describe('getById', () => {
     it('should return an analysis for a valid ID and authenticated user', async () => {
      const analysisId = crypto.randomUUID()
      const mockAnalysis = {
        id: analysisId,
        userId: mockSession.user.id,
        fileName: 'test.tsx',
        suggestions: '[]',
      }
      
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockAnalysis]),
          }),
        }),
      } as any)
      
      const result = await caller.analysis.getById({ id: analysisId })

      expect(result.id).toBe(analysisId)
      expect(result.userId).toBe(mockSession.user.id)
    })

    it('should throw NOT_FOUND if analysis does not exist', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No analysis found
          }),
        }),
      } as any)
      
      await expect(caller.analysis.getById({ id: crypto.randomUUID() })).rejects.toThrow('NOT_FOUND')
    })
    
     it('should throw NOT_FOUND if a different user tries to access the analysis', async () => {
      const analysisId = crypto.randomUUID()
      const mockAnalysis = {
        id: analysisId,
        userId: 'different-user-id',
        fileName: 'test.tsx',
        suggestions: '[]',
      }

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // Simulate no result due to where clause
          }),
        }),
      } as any)

      await expect(caller.analysis.getById({ id: analysisId })).rejects.toThrow('NOT_FOUND')
    })
  })
})
