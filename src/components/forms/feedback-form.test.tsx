import { render, screen } from '@/test/utils/test-utils';
import { FeedbackForm } from '@/components/forms/feedback-form';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

const formSchema = z.object({
  feedback: z
    .string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(2000, 'Feedback cannot exceed 2000 characters'),
});

const TestHarness = ({
  onSubmit = vi.fn(),
  isLoading = false,
  disabled = false,
}) => {
  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { feedback: '' },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FeedbackForm isLoading={isLoading} disabled={disabled} />
      </form>
    </FormProvider>
  );
};

describe('FeedbackForm', () => {
  it('should render the form correctly', () => {
    render(<TestHarness />);
    expect(
      screen.getByPlaceholderText(
        "e.g., 'Make the button more vibrant and add a hover effect.'"
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze feedback/i })).toBeInTheDocument();
  });

  it('should show validation error for feedback that is too short', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    const textarea = screen.getByPlaceholderText(
      "e.g., 'Make the button more vibrant and add a hover effect.'"
    );
    await user.type(textarea, 'short');
    await user.click(screen.getByRole('button', { name: /analyze feedback/i }));

    expect(
      await screen.findByText('Feedback must be at least 10 characters')
    ).toBeInTheDocument();
  });

  it('should show validation error for feedback that is too long', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    const textarea = screen.getByPlaceholderText(
      "e.g., 'Make the button more vibrant and add a hover effect.'"
    );
    const longText = 'a'.repeat(2001);
    await user.type(textarea, longText);
    await user.click(screen.getByRole('button', { name: /analyze feedback/i }));

    expect(
      await screen.findByText('Feedback cannot exceed 2000 characters')
    ).toBeInTheDocument();
  });

  it('should disable the submit button when disabled prop is true', () => {
    render(<TestHarness disabled={true} />);
    expect(screen.getByRole('button', { name: /analyze feedback/i })).toBeDisabled();
  });

  it('should show loading state when isLoading prop is true', () => {
    render(<TestHarness isLoading={true} />);
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeInTheDocument();
  });

  it('should call onSubmit with valid data', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<TestHarness onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText(
      "e.g., 'Make the button more vibrant and add a hover effect.'"
    );
    await user.type(textarea, 'This is a valid piece of feedback.');
    await user.click(screen.getByRole('button', { name: /analyze feedback/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      { feedback: 'This is a valid piece of feedback.' },
      expect.anything()
    );
  });
});
