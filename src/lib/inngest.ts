import { Inngest } from 'inngest';

// Create a client to send and receive events
export const inngest = new Inngest({
  id: 'client-feedback-translator',
  // Use Inngest Cloud in production, disable in development to avoid fetch errors
  baseUrl: process.env.NODE_ENV === 'production' ? process.env.INNGEST_BASE_URL : undefined,
});
