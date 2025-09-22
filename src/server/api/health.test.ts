import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '@/server/api/root';

describe('Health Check', () => {
  it('should return health status', async () => {
    const caller = appRouter.createCaller({} as any);

    // Mock the actual procedure if it makes external calls
    const result = await caller.health.check();

    expect(result.status).toBe('ok');
    expect(result.message).toBe('tRPC server is running');
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(result.timestamp)).toBeInstanceOf(Date);
  });
});
