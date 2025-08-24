'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RatingSystemProps {
  translationId: string;
  onRatingSuccess: () => void;
}

export function RatingSystem({ translationId, onRatingSuccess }: RatingSystemProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitRating = async (selectedRating: number) => {
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);
    setRating(selectedRating);

    try {
      const response = await fetch(`/api/translations/${translationId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: selectedRating }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit rating.');
      }
      
      toast.success('Thank you for your feedback!');
      setIsSubmitted(true);
      onRatingSuccess();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(errorMessage);
      setRating(0); // Reset on error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center space-x-2 py-2">
        <p className="text-sm text-muted-foreground">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-2">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleSubmitRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
            disabled={isSubmitting || isSubmitted}
          >
            <Star
              className={cn(
                'h-6 w-6 cursor-pointer transition-colors',
                starValue <= (hover || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
