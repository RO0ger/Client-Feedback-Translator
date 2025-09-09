'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface FeedbackFormProps {
  isLoading?: boolean;
  disabled?: boolean;
}

export function FeedbackForm({
  isLoading = false,
  disabled = false,
}: FeedbackFormProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div>
        <Textarea
          {...register('feedback')}
          placeholder="e.g., 'Make the button more vibrant and add a hover effect.'"
          className={`w-full p-3 border rounded-lg resize-none ${
            errors.feedback
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300 focus:border-blue-500'
          }`}
          rows={6}
          disabled={disabled}
        />
        {errors.feedback && (
          <p className="mt-1 text-sm text-red-600">
            {errors.feedback.message as string}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={disabled}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze Feedback'
        )}
      </Button>
    </div>
  );
}
