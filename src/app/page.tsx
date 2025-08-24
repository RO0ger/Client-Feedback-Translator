'use client';

import { useState, useRef } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FeedbackInput } from '@/components/FeedbackInput';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { TranslateResponse } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { TranslationHistory, TranslationHistoryHandle } from '@/components/TranslationHistory';

export default function Home() {
  const [componentCode, setComponentCode] = useState<string>('');
  const [componentFile, setComponentFile] = useState<File | null>(null);
  const [apiResponse, setApiResponse] = useState<TranslateResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<TranslationHistoryHandle>(null);

  const handleFileAccepted = (file: File, content: string) => {
    setComponentFile(file);
    setComponentCode(content);
    setApiResponse(null);
    setError(null);
  };

  const handleSelectTranslation = async (id: string) => {
    // This function would be responsible for fetching the full translation details
    // by its ID from the database and displaying it in the main view.
    // This is a feature to be implemented in a future version.
    toast.info("Loading a translation from history is not yet implemented.");
  };

  const handleSubmitFeedback = async (feedback: string) => {
    if (!componentCode) {
      toast.error('No component uploaded', {
        description: 'Please upload a component file before submitting feedback.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          componentCode,
          feedback,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the detailed error message from the API
        const errorTitle = data.error || 'An error occurred';
        const errorDescription = data.details || 'The server encountered an issue.';
        throw new Error(`${errorTitle}: ${errorDescription}`);
      }

      setApiResponse(data);
      historyRef.current?.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast.error('Translation Error', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col md:flex-row w-full">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Consider adding an illustrative hero image or icon at the top, above the header, to enhance visual appeal.  This would require finding an appropriate asset. */}
            <header className="text-center mb-12">
              <h1 className="text-5xl font-extrabold text-foreground tracking-tight">Client Feedback Translator</h1>
              <p className="text-lg text-foreground/80 mt-4">
                Upload your React component, provide client feedback, and get actionable code changes instantly.
              </p>
            </header>

            <div className="space-y-12 p-6 bg-card rounded-lg shadow-lg">
              <section>
                <h2 className="text-3xl font-bold text-foreground mb-6">1. Upload Component</h2>
                <div className="bg-muted text-foreground rounded-lg p-4 border"><FileUpload onFileAccepted={handleFileAccepted} /></div>
              </section>

              {componentCode && (
                <section>
                  <h2 className="text-3xl font-bold text-foreground mb-6">2. Provide Feedback</h2>
                  <FeedbackInput onSubmit={handleSubmitFeedback} isLoading={isLoading} />
                </section>
              )}

              {error && (
                <div className="rounded-lg border border-red-600 bg-red-800 p-4 text-red-200">
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
              )}

              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 p-8">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Translating your feedback...</p>
                </div>
              )}
              
              {apiResponse && (
                 <section>
                    <h2 className="text-3xl font-bold text-foreground mb-6">3. Suggested Changes</h2>
                    <ResultsDisplay response={apiResponse} translationId={apiResponse.id} />
                 </section>
              )}

            </div>
          </div>
        </main>
        <div className="translation-history-container bg-card p-6 rounded-lg shadow-lg border md:ml-4 md:w-1/3 lg:w-1/4">
          <TranslationHistory ref={historyRef} onSelectTranslation={handleSelectTranslation} />
        </div>
      </div>
    </div>
  );
}
