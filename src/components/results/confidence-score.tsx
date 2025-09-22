export function ConfidenceScore({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl border border-gray-600/30">
      <h4 className="font-semibold text-gradient-primary mb-2 font-inter">
        Confidence Score
      </h4>
      <p
        data-testid="confidence-score"
        className={`text-3xl font-bold font-inter ${getScoreColor(score)}`}
      >
        {score}%
      </p>
    </div>
  );
}
