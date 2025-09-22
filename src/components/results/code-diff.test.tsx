import { render, screen, within, waitFor } from '@/test/utils/test-utils';
import { CodeDiff } from '@/components/results/code-diff';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProps = {
  before: 'const a = 1;',
  after: 'const a = 2;',
  language: 'typescript',
  description: 'Changed the value of a',
  type: 'props' as const,
};

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe('CodeDiff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render before and after code blocks', async () => {
    render(<CodeDiff {...mockProps} />);

    const beforeBlock = screen.getByText('Before').closest('div')?.parentElement;
    const afterBlock = screen.getByText('After').closest('div')?.parentElement;

    await waitFor(() => {
      expect(beforeBlock).toHaveTextContent(mockProps.before);
      expect(afterBlock).toHaveTextContent(mockProps.after);
    });
  });

  it('should render the correct icon and description', () => {
    render(<CodeDiff {...mockProps} />);
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
    expect(screen.getByText(mockProps.type)).toBeInTheDocument();
  });

  it('should handle copy to clipboard for before and after code', async () => {
    const user = userEvent.setup();
    render(<CodeDiff {...mockProps} />);
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');

    const beforeButton = screen.getByText('Before').closest('div')?.querySelector('button');
    const afterButton = screen.getByText('After').closest('div')?.querySelector('button');

    // Copy 'before' code
    await user.click(beforeButton!);
    expect(writeTextSpy).toHaveBeenCalledWith(mockProps.before);

    // Copy 'after' code
    await user.click(afterButton!);
    expect(writeTextSpy).toHaveBeenCalledWith(mockProps.after);
  });
});
