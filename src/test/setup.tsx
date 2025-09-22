import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { server } from './mocks/server'

// Mock next-auth to prevent next/server import errors
vi.mock('next-auth', () => ({
  default: vi.fn(),
}));

vi.mock('@/auth', async (importOriginal) => {
  const mod = await importOriginal() as any;
  return {
    ...mod,
    auth: vi.fn(() => ({
      user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
    })),
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
});


// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
}

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    return {
      type: 'a',
      props: { href, ...props, children },
      key: null
    }
  },
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
  notFound: vi.fn(),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return {
      type: 'img',
      props: { src, alt, ...props },
      key: null
    }
  },
}))

// Mock environment variables
vi.mock('next/config', () => ({
  default: () => ({
    publicRuntimeConfig: {},
    serverRuntimeConfig: {},
  }),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

window.HTMLElement.prototype.scrollIntoView = vi.fn()

// Mock CMDk components to prevent appendChild errors
vi.mock('@/components/ui/command', () => ({
  Command: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CommandInput: ({ value, onValueChange, ...props }: any) => (
    <input
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      {...props}
    />
  ),
  CommandList: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CommandItem: ({ children, onSelect, ...props }: any) => (
    <div onClick={onSelect} {...props}>
      {children}
    </div>
  ),
}));


// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())
