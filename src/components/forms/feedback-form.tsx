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
          className={`w-full p-4 border rounded-xl resize-none backdrop-blur-sm transition-all duration-200 ${
            errors.feedback
              ? 'border-red-400 focus:border-red-500 bg-red-50/50'
              : 'border-gray-300 focus:border-blue-400 bg-white/60 hover:bg-white/70 focus:bg-white/80'
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
        className="w-full py-4 px-6 gradient-button text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
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
