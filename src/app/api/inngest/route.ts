import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { processAnalysis, handleAnalysisFailure } from '@/inngest/functions';

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processAnalysis, handleAnalysisFailure],
});
