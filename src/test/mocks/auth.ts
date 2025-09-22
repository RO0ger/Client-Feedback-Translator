
import { http, HttpResponse } from 'msw'

export const mockAuth = async () => ({
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/test.jpg',
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
})

export const mockSignIn = async (provider: string) => {
  console.log(`Mock signIn called with provider: ${provider}`)
  return { url: `/api/auth/signin/${provider}` }
}

export const mockSignOut = async () => {
  console.log('Mock signOut called')
  return { url: '/' }
}

export const mockHandlers = [
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/test.jpg',
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }),
  http.post('/api/auth/signin/:provider', ({ params }) => {
    console.log(`Mock signin handler for provider: ${params.provider}`)
    return HttpResponse.json({ url: `/api/auth/signin/${params.provider}` })
  }),
  http.post('/api/auth/signout', () => {
    console.log('Mock signout handler')
    return HttpResponse.json({ url: '/' })
  }),
]

// We need to provide a mock for AuthOptions as well, even if it's minimal, to satisfy type checks.
// In a test environment, these options are typically not used as the actual authentication flow is bypassed.
export const mockAuthOptions = {
  secret: 'mock_secret',
  providers: [],
  callbacks: {},
}
