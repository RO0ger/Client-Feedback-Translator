import { notFound } from "next/navigation";
import { CodeDiff } from "@/components/results/code-diff";
import { ConfidenceScore } from "@/components/results/confidence-score";
import { HistorySidebar } from "@/components/history/history-sidebar";
import { BackButton } from "@/components/ui/back-button";
import { createApiCaller } from "@/lib/trpc/server";
import { MotionDiv } from "@/components/animations/motion-div";

export const revalidate = 60 // Revalidate page every 60 seconds

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  const api = await createApiCaller();
  const analysis = await api.analysis.getById({ id }).catch(() => null);

  if (!analysis) {
    notFound();
  }

  const suggestions = (analysis.suggestions as any) as Array<{
    type: "css" | "animation" | "props" | "structure";
    before: string;
    after: string;
    explanation: string;
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
            <h1 className="text-2xl font-bold text-gradient-primary text-glow md:text-3xl font-inter">
              {analysis.fileName}
            </h1>
            <p className="mt-1 text-gradient-secondary font-inter">Analysis Results</p>
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
            <div className="rounded-3xl modern-glass p-6 premium-shadow lg:sticky lg:top-8 md:p-8">
              <h2 className="mb-6 text-xl font-bold text-gradient-primary text-glow md:text-2xl font-inter">
                Interpretation
              </h2>
              <p className="mb-8 text-gradient-secondary leading-relaxed font-inter" data-testid="interpretation">
                {analysis.interpretation}
              </p>

              <ConfidenceScore score={analysis.confidence} />

              <div className="mt-8 p-5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-400/30">
                <h3 className="font-semibold text-gradient-primary mb-3 font-inter">
                  Original Feedback
                </h3>
                <p className="text-gradient-secondary text-base italic font-inter">
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
      </div>

      <HistorySidebar />
    </div>
  );
}
