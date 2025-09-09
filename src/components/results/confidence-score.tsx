export function ConfidenceScore({ score }: { score: number }) {
  return (
    <div>
      <h4 className="font-semibold">Confidence Score</h4>
      <p data-testid="confidence-score">{score}%</p>
    </div>
  );
}
