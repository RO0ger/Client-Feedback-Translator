import { notFound } from "next/navigation";
import { CodeDiff } from "@/components/results/code-diff";
import { ConfidenceScore } from "@/components/results/confidence-score";
import { HistorySidebar } from "@/components/history/history-sidebar";
import { BackButton } from "@/components/ui/back-button";
import { createApiCaller } from "@/lib/trpc/server";
import { MotionDiv } from "@/components/animations/motion-div";

export const revalidate = 60 // Revalidate page every 60 seconds

interface ResultsPageProps {
  params: { id: string };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const api = await createApiCaller();
  const analysis = await api.analysis.getById({ id: params.id }).catch(() => null);

  if (!analysis) {
    notFound();
  }

  const suggestions = analysis.suggestions as Array<{
    description: string;
    before: string;
    after: string;
    type: "css" | "animation" | "props" | "structure";
  }>;

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
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {analysis.fileName}
            </h1>
            <p className="mt-1 text-gray-600">Analysis Results</p>
          </div>
        </MotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Interpretation */}
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="rounded-2xl border border-white/20 bg-white/70 p-4 shadow-2xl backdrop-blur-lg lg:sticky lg:top-8 md:p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 md:text-xl">
                Interpretation
              </h2>
              <p className="mb-6 text-gray-700" data-testid="interpretation">
                {analysis.interpretation}
              </p>

              <ConfidenceScore score={analysis.confidence} />

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-medium text-blue-900 mb-2">
                  Original Feedback
                </h3>
                <p className="text-blue-800 text-sm italic">
                  &ldquo;{analysis.feedback}&rdquo;
                </p>
              </div>
            </div>
          </MotionDiv>

          {/* Right Column - Suggestions */}
          <MotionDiv
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h2 className="mb-6 text-xl font-semibold text-gray-900 md:text-2xl">
              Suggested Changes
            </h2>
            <div className="space-y-8" data-testid="code-suggestions">
              {suggestions.map((suggestion, index) => (
                <CodeDiff
                  key={index}
                  before={suggestion.before}
                  after={suggestion.after}
                  language="typescript"
                  description={suggestion.description}
                  type={suggestion.type}
                />
              ))}
            </div>
          </MotionDiv>
        </div>
      </div>

      <HistorySidebar />
    </div>
  );
}
