'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CodeDiff } from "@/components/results/code-diff";
import { ConfidenceScore } from "@/components/results/confidence-score";
import { HistorySidebar } from "@/components/history/history-sidebar";
import { BackButton } from "@/components/ui/back-button";
import { trpc } from "@/utils/trpc";
import { MotionDiv } from "@/components/animations/motion-div";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

function AnalysisStatusIndicator({ status, isComplete, isFailed, isPending, isProcessing }: {
  status: string;
  isComplete: boolean;
  isFailed: boolean;
  isPending: boolean;
  isProcessing: boolean;
}) {
  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-yellow-500">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Analysis Pending</span>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex items-center gap-2 text-blue-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Processing Analysis...</span>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Analysis Complete</span>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <XCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Analysis Failed</span>
      </div>
    );
  }

  return null;
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const router = useRouter();
  const [analysisId, setAnalysisId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => setAnalysisId(id));
  }, [params]);

  const { data: analysis, isLoading: isLoadingAnalysis } = trpc.analysis.getById.useQuery(
    { id: analysisId },
    { enabled: !!analysisId }
  );

  const { data: status, refetch: refetchStatus } = trpc.analysis.getStatus.useQuery(
    { id: analysisId },
    {
      enabled: !!analysisId,
      refetchInterval: 2000, // Poll every 2 seconds
      refetchIntervalInBackground: false,
    }
  );

  useEffect(() => {
    if (status?.status === 'COMPLETE' || status?.status === 'FAILED') {
      setIsLoading(false);
    }
  }, [status]);

  if (!analysisId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const suggestions = analysis?.suggestions ? (analysis.suggestions as any) as Array<{
    type: "css" | "animation" | "props" | "structure";
    before: string;
    after: string;
    explanation: string;
  }> : [];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-4"
        >
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-gradient-primary text-glow md:text-3xl font-inter">
              {analysis?.fileName || 'Loading...'}
            </h1>
            <p className="mt-1 text-gradient-secondary font-inter">Analysis Results</p>
            {status && (
              <div className="mt-2">
                <AnalysisStatusIndicator {...status} />
              </div>
            )}
          </div>
        </MotionDiv>

        {isLoading || status?.isProcessing ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Analyzing Your Component
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Our AI is processing your feedback and generating suggestions.
              This usually takes 10-30 seconds.
            </p>
          </div>
        ) : status?.isFailed ? (
          <div className="flex flex-col items-center justify-center py-16">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Analysis Failed
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-4">
              We encountered an error while processing your component.
              Please try again.
            </p>
            <Button
              onClick={() => router.back()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : analysis && status?.isComplete && analysis.interpretation && analysis.confidence ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Original Feedback */}
            <MotionDiv
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="rounded-3xl modern-glass p-6 premium-shadow lg:sticky lg:top-8 md:p-8">
                <h2 className="mb-6 text-xl font-bold text-gradient-primary text-glow md:text-2xl font-inter">
                  Original Feedback
                </h2>
                <div className="mb-8 p-5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-400/30">
                  <p className="text-gradient-secondary text-base font-inter leading-relaxed">
                    &ldquo;{analysis.feedback}&rdquo;
                  </p>
                </div>

                <h3 className="mb-4 text-lg font-semibold text-gradient-primary font-inter">
                  AI Interpretation
                </h3>
                <p className="mb-6 text-gradient-secondary leading-relaxed font-inter text-sm" data-testid="interpretation">
                  {analysis.interpretation}
                </p>

                {analysis.confidence !== null ? (
                  <ConfidenceScore score={analysis.confidence} />
                ) : (
                  <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl border border-gray-600/30">
                    <h4 className="font-semibold text-gradient-primary mb-2 font-inter">
                      Confidence Score
                    </h4>
                    <p className="text-3xl font-bold text-gray-400 font-inter">
                      --
                    </p>
                  </div>
                )}
              </div>
            </MotionDiv>

            {/* Right Column - Suggestions */}
            <MotionDiv
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <h2 className="mb-8 text-2xl font-bold text-gradient-primary text-glow md:text-3xl font-inter">
                Suggested Changes
              </h2>
              <div className="space-y-8" data-testid="code-suggestions">
                {suggestions.map((suggestion, index) => (
                  <CodeDiff
                    key={index}
                    before={suggestion.before}
                    after={suggestion.after}
                    language="typescript"
                    description={suggestion.explanation}
                    type={suggestion.type}
                  />
                ))}
              </div>
            </MotionDiv>
          </div>
        ) : null}
      </div>

      <HistorySidebar />
    </div>
  );
}
