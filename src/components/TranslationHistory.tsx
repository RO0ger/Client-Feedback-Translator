'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'sonner';
import { Translation } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

type TranslationHistoryItem = Pick<Translation, 'id' | 'component_name' | 'original_feedback' | 'created_at'>;

interface TranslationHistoryProps {
  onSelectTranslation: (id: string) => void;
}

export interface TranslationHistoryHandle {
  refresh: () => void;
}

export const TranslationHistory = forwardRef<TranslationHistoryHandle, TranslationHistoryProps>(
  ({ onSelectTranslation }, ref) => {
    const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/translations');
        if (!response.ok) {
          throw new Error('Failed to fetch translation history.');
        }
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error(error);
        toast.error('Could not load translation history.');
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchHistory();
    }, []);

    useImperativeHandle(ref, () => ({
      refresh: fetchHistory,
    }));

    const filteredHistory = history.filter(
      (item) =>
        item.component_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.original_feedback.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="flex flex-col h-full">
        <h2 className="text-xl font-bold mb-4 text-foreground">History</h2>
        <Input
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="flex-grow">
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-muted-foreground">Loading history...</p>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectTranslation(item.id)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <p className="font-semibold text-foreground">{item.component_name || 'Untitled'}</p>
                  <p className="text-sm text-muted-foreground">{item.original_feedback}</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-muted-foreground">No history found.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
);

TranslationHistory.displayName = 'TranslationHistory';
