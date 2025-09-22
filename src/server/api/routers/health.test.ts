import { describe, it, expect } from 'vitest';
import { appRouter } from '@/server/api/root';

describe('Health Check', () => {
  it('should initialize the tRPC server without errors', () => {
    expect(appRouter).toBeDefined();
  });
});
