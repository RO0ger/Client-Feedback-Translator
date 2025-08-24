'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface FeedbackInputProps {
  onSubmit: (feedback: string) => void;
  isLoading: boolean;
}

export function FeedbackInput({ onSubmit, isLoading }: FeedbackInputProps) {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onSubmit(feedback);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="e.g., 'Make the button more vibrant' or 'This form feels too cramped...'"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={4}
        disabled={isLoading}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || !feedback.trim()}>
          {isLoading ? (
            'Translating...'
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Translate Feedback
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
