import { notFound } from "next/navigation";
import { CodeDiff } from "@/components/results/code-diff";
import { ConfidenceScore } from "@/components/results/confidence-score";
import { HistorySidebar } from "@/components/history/history-sidebar";
import { BackButton } from "@/components/ui/back-button";
import { api } from "@/lib/trpc/server";

interface ResultsPageProps {
  params: { id: string };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
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
      <div className="container max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {analysis.fileName}
            </h1>
            <p className="text-gray-600 mt-1">Analysis Results</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Interpretation */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Interpretation
              </h2>
              <p className="text-gray-700 mb-6" data-testid="interpretation">
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
          </div>

          {/* Right Column - Suggestions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
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
          </div>
        </div>
      </div>

      <HistorySidebar />
    </div>
  );
}
