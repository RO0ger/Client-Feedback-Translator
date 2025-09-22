import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock data for testing
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
}

const mockFeedback = {
  id: 1,
  content: 'This is a test feedback',
  rating: 5,
  category: 'feature' as const,
  userId: 'test-user-id',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  createdBy: 'test-user-id',
  updatedBy: 'test-user-id',
  isDeleted: false,
}

// Mock tRPC endpoints
const handlers = [
  // Health check endpoint
  http.post('http://localhost:3000/api/trpc/health.check', () => {
    return HttpResponse.json({
      result: {
        data: {
          status: 'ok',
          timestamp: new Date().toISOString(),
          message: 'tRPC server is running'
        }
      }
    })
  }),

  // Auth endpoints
  http.post('http://localhost:3000/api/auth/session', () => {
    return HttpResponse.json({
      user: mockUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  }),

  // NextAuth endpoints
  http.post('http://localhost:3000/api/auth/signin/email', () => {
    return HttpResponse.json({ ok: true })
  }),

  // Mock feedback endpoints (when they exist)
  http.post('http://localhost:3000/api/trpc/feedback.create', () => {
    return HttpResponse.json({
      result: {
        data: {
          ...mockFeedback,
          id: Date.now(), // Generate unique ID
        }
      }
    })
  }),

  http.post('http://localhost:3000/api/trpc/feedback.getInfinite', () => {
    return HttpResponse.json({
      result: {
        data: {
          items: [mockFeedback],
          nextCursor: null,
        }
      }
    })
  }),

  http.get('http://localhost:3000/api/trpc/history.getInfinite', () => {
    return HttpResponse.json([
      {
        result: {
          data: {
            json: {
              items: [
                {
                  id: 'mock-analysis-id-1',
                  fileName: 'TestComponent.tsx',
                  feedback: 'Initial feedback',
                  confidence: 90,
                  createdAt: new Date().toISOString(),
                },
              ],
              nextCursor: null,
            },
          },
        },
      },
    ]);
  }),

  http.get('http://localhost:3000/api/trpc/history.search', () => {
    return HttpResponse.json([
      {
        result: {
          data: {
            json: [
              {
                id: 'mock-analysis-id-1',
                fileName: 'TestComponent.tsx',
                feedback: 'Initial feedback',
                confidence: 90,
                createdAt: new Date().toISOString(),
              },
            ],
          },
        },
      },
    ]);
  }),

  // Mock translation endpoints (when they exist)
  http.post('http://localhost:3000/api/trpc/translation.create', () => {
    return HttpResponse.json({
      result: {
        data: {
          id: Date.now(),
          feedbackId: 1,
          originalText: 'Test feedback',
          translatedText: 'Translated test feedback',
          targetLanguage: 'es',
          createdAt: new Date().toISOString(),
        }
      }
    })
  }),

  // Mock analysis endpoint to be compatible with tRPC batching
  http.post('http://localhost:3000/api/trpc/analysis.create', async () => {
    return HttpResponse.json([
      {
        result: {
          data: {
            json: {
              id: 'mock-analysis-id',
              fileName: 'App.tsx',
              fileSize: 123,
              originalContent: 'const App = () => {}',
              feedback: 'make it more interactive and engaging',
              interpretation: 'The user wants a more dynamic component.',
              suggestions: '[]',
              confidence: 95,
              userId: 'test-user-id',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isDeleted: false,
            },
            meta: {
              responseShape: 'standard',
            },
          },
        },
      },
    ]);
  }),

  // Catch-all for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    return new HttpResponse(null, { status: 404 })
  }),
]

export const server = setupServer(...handlers)

// Helper to mock authenticated user
export const mockAuthenticatedUser = (
  options: { error?: boolean } = {}
) => {
  server.use(
    http.post('http://localhost:3000/api/auth/session', () => {
      return HttpResponse.json({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }),
    http.post('http://localhost:3000/api/trpc/analysis.create', async ({ request }) => {
      if (options.error) {
        // This is the EXACT format tRPC expects based on the error output
        // The key insight: remove the nested "json" wrapper completely
        return HttpResponse.json([
          {
            error: {
              message: "Analysis creation failed",
              code: -32603,
              data: {
                code: "INTERNAL_SERVER_ERROR",
                httpStatus: 500,
                path: "analysis.create"
              }
            }
          }
        ], { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Success response
      return HttpResponse.json([
        {
          result: {
            data: {
              id: "mock-analysis-id",
              status: "completed"
            }
          }
        }
      ]);
    })
  );
};

// Helper to mock unauthenticated user
export const mockUnauthenticatedUser = () => {
  server.use(
    http.post('http://localhost:3000/api/auth/session', () => {
      return HttpResponse.json(null)
    })
  )
}

// Helper to mock API errors
export const mockApiError = (endpoint: string, error: any) => {
  server.use(
    http.post(`http://localhost:3000/api/trpc/${endpoint}`, () => {
      return HttpResponse.json({
        error: {
          json: error
        }
      })
    })
  )
}
