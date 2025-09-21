import { TranslateResponse, Change } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { CodeComparison } from './CodeComparison';
import { RatingSystem } from '../RatingSystem';


interface ResultsDisplayProps {
    response: TranslateResponse;
    translationId?: string;
}

const ChangeCard = ({ change }: { change: Change }) => {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    }

    return (
        <div className="overflow-hidden rounded-lg border">
            <header className="flex items-center justify-between bg-muted/50 p-4">
                <Badge variant="secondary" className="capitalize">{change.type}</Badge>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{change.explanation}</p>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(change.after)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                    </Button>
                </div>
            </header>
            <div className="p-4">
                <CodeComparison before={change.before} after={change.after} />
            </div>
        </div>
    );
};

export function ResultsDisplay({ response, translationId }: ResultsDisplayProps) {
    const handleRatingSuccess = () => {
        // Potentially disable rating or show a thank you message.
        // The RatingSystem component handles its own state, so this could be used
        // for parent-level state changes if needed in the future.
        console.log('Rating submitted successfully from parent.');
    };

    return (
        <div className="space-y-8">
            <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-semibold text-lg mb-2">Interpretation</h3>
                <p className="text-muted-foreground">{response.interpretation}</p>
                <div className="mt-4">
                    <Badge>Confidence: {(response.confidence * 100).toFixed(0)}%</Badge>
                </div>
            </div>

            <div className="space-y-6">
                {response.actionable_changes.map((change, index) => (
                    <ChangeCard key={index} change={change} />
                ))}
            </div>

            {response.reasoning && (
                 <div className="p-4 border rounded-lg bg-muted/20">
                    <h3 className="font-semibold text-lg mb-2">Reasoning</h3>
                    <p className="text-muted-foreground">{response.reasoning}</p>
                </div>
            )}
            
            {translationId && (
              <div className="border-t pt-6">
                  <h3 className="text-center text-lg font-semibold mb-2">Was this translation helpful?</h3>
                  <RatingSystem 
                      translationId={translationId} 
                      onRatingSuccess={handleRatingSuccess}
                  />
              </div>
            )}
        </div>
    );
}
