import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement } from 'react';
import { Providers } from '@/app/_components/providers';

/**
 * Custom render function that includes all necessary providers
 * Use this for testing components that need tRPC, React Query, etc.
 */
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <Providers>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Providers>
  );
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { rerender, ...rtlRenderResult } = render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });

  const rerenderWithProviders = (ui: ReactElement) =>
    rerender(ui);

  return {
    ...rtlRenderResult,
    rerender: rerenderWithProviders,
  };
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render method with our custom one
export { customRender as render };
