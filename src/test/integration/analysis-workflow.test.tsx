import { describe, it, expect, vi } from 'vitest';
import {
  render,
  screen,
  waitFor,
  mockAuthenticatedUser,
} from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/app/(dashboard)/dashboard/page';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: vi.fn() }),
}));

// Mock FileReader
vi.spyOn(window, 'FileReader').mockImplementation(
  () =>
    ({
      readAsText: vi.fn(function (this: any) {
        this.onload({ target: { result: 'const App = () => {}' } });
      }),
      onerror: vi.fn(),
    } as any)
);

describe('Analysis Workflow Integration', () => {
  // it('should complete full analysis workflow and handle validation', async () => {
  //   mockAuthenticatedUser();
  //   const user = userEvent.setup();
  //   render(<DashboardPage />);

  //   // 1. Initially, try to submit without a file or feedback to check validation
  //   const submitButton = screen.getByRole('button', { name: /analyze/i });
  //   await user.click(submitButton);

  //   await waitFor(() => {
  //     expect(
  //       screen.getByText('A component file is required.')
  //     ).toBeInTheDocument();
  //     expect(
  //       screen.getByText('Feedback must be at least 10 characters.')
  //     ).toBeInTheDocument();
  //   });

  //   // 2. Upload a valid file
  //   const fileInput = screen.getByTestId('file-upload-input');
  //   const file = new File(
  //     ['const App = () => <div className="boring">Hello</div>'],
  //     'App.tsx',
  //     { type: 'text/typescript' }
  //   );
  //   await user.upload(fileInput, file);

  //   await waitFor(() => {
  //     expect(screen.getByText('App.tsx')).toBeInTheDocument();
  //   });

  //   // 3. Provide valid feedback
  //   const feedbackInput = screen.getByPlaceholderText(
  //     "e.g., 'Make the button more vibrant and add a hover effect.'"
  //   );
  //   await user.type(feedbackInput, 'make it more interactive and engaging');

  //   // 4. Submit the form again
  //   await user.click(submitButton);

  //   // 5. Verify navigation to the results page on success
  //   await waitFor(
  //     () => {
  //       expect(mockPush).toHaveBeenCalledWith('/results/mock-analysis-id');
  //     },
  //     { timeout: 5000 }
  //   );
  // });

  it('should handle upload errors gracefully', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);
    
    // Try to upload invalid file
    const fileInput = screen.getByTestId('file-upload-input');
    const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    
    await user.upload(fileInput, invalidFile);
    
    await waitFor(() => {
      expect(screen.getByText(/upload error/i)).toBeInTheDocument();
    });
  });

  it('should handle history sidebar functionality and navigation', async () => {
    mockAuthenticatedUser();
    const user = userEvent.setup();
    render(<DashboardPage />);

    // 1. Open history sidebar
    const historyButton = screen.getByRole('button', {
      name: /analysis history/i,
    });
    await user.click(historyButton);

    await waitFor(() => {
      expect(screen.getByText('Analysis History')).toBeInTheDocument();
    });

    // 2. Verify history items are loaded
    await waitFor(() => {
      expect(screen.getByText('TestComponent.tsx')).toBeInTheDocument();
    });

    // 3. Test search functionality
    const searchInput = screen.getByPlaceholderText('Search your analyses...');
    await user.type(searchInput, 'TestComponent');

    await waitFor(() => {
      expect(screen.getByText('TestComponent.tsx')).toBeInTheDocument();
    });

    // 4. Test navigation to a result page
    const historyItem = screen.getByText('TestComponent.tsx');
    await user.click(historyItem);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/results/mock-analysis-id-1');
    });
  });

  // it('should handle API error on analysis creation', async () => {
  //   const user = userEvent.setup();
      
  //   // Set up the error mock BEFORE rendering
  //   mockAuthenticatedUser({ error: true });

  //   render(<DashboardPage />); // Assuming DashboardPage is the component under test

  //   // 1. Upload a file
  //   const file = new File(['const App = () => <div>Hello</div>;'], 'App.tsx', {
  //     type: 'text/plain'
  //   });
  //   const fileInput = screen.getByTestId('file-upload-input');
  //   await user.upload(fileInput, file);

  //   // Wait for file to be processed (adjust if there's a processing indicator)
  //   await waitFor(() => {
  //     expect(screen.getByText('App.tsx')).toBeInTheDocument();
  //   });

  //   // 2. Fill in feedback
  //   const feedbackInput = screen.getByPlaceholderText(
  //     "e.g., 'Make the button more vibrant and add a hover effect.'"
  //   );
  //   await user.type(feedbackInput, 'Make the button more vibrant');

  //   // 3. Submit the form
  //   const submitButton = screen.getByRole('button', { name: /analyze/i });
  //   await user.click(submitButton);

  //   // 4. Wait for error message to appear
  //   await waitFor(
  //     () => {
  //       // Try different possible error message locations
  //       const errorMessage =
  //         screen.queryByText(/analysis creation failed/i) ||
  //         screen.queryByText(/error/i) ||
  //         screen.queryByText(/failed/i) ||
  //         screen.queryByText(/something went wrong/i);
          
  //       expect(errorMessage).toBeInTheDocument();
  //     },
  //     { timeout: 10000 } // Increase timeout for network requests
  //   );
  // });

  // // Alternative test that catches the tRPC error directly
  // it('should handle tRPC transformation errors gracefully', async () => {
  //   const user = userEvent.setup();
      
  //   // Mock console.error to catch tRPC errors
  //   const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
  //   mockAuthenticatedUser({ error: true });
  //   render(<DashboardPage />);

  //   // Upload file and submit feedback
  //   const file = new File(['const App = () => <div>Hello</div>;'], 'App.tsx', {
  //     type: 'text/plain'
  //   });
  //   const fileInput = screen.getByTestId('file-upload-input');
  //   await user.upload(fileInput, file);

  //   await waitFor(() => {
  //     expect(screen.getByText('App.tsx')).toBeInTheDocument();
  //   });

  //   const feedbackInput = screen.getByPlaceholderText(
  //     "e.g., 'Make the button more vibrant and add a hover effect.'"
  //   );
  //   await user.type(feedbackInput, 'Make the button more vibrant');

  //   const submitButton = screen.getByRole('button', { name: /analyze/i });
  //   await user.click(submitButton);

  //   // Wait for the tRPC error to be logged
  //   await waitFor(() => {
  //     expect(consoleSpy).toHaveBeenCalledWith(
  //       expect.stringContaining('TRPCClientError')
  //     );
  //   }, { timeout: 10000 });

  //   // Verify that some error state is shown to the user
  //   // This could be a generic error message or the form staying enabled
  //   await waitFor(() => {
  //     // The submit button should be enabled again after error
  //     expect(submitButton).not.toBeDisabled();
  //   });

  //   consoleSpy.mockRestore();
  // });
});
