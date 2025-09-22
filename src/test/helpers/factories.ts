/**
 * Test data factories for creating consistent test data
 * This makes tests more maintainable and reduces duplication
 */

import { z } from 'zod';
import { fileUploadSchema } from '@/lib/validations/analysis';

// Mock file factory
export const createMockFile = (
  name: string,
  size: number = 1024,
  type: string = 'text/javascript'
): File => {
  return new File(['mock file content'], name, {
    type,
    size,
  });
};

// Valid file for testing
export const createValidJSFile = (name: string = 'test.js') =>
  createMockFile(name, 500, 'text/javascript');

// Valid TSX file for testing
export const createValidTSXFile = (name: string = 'test.tsx') =>
  createMockFile(name, 800, 'text/typescript-jsx');

// Invalid file type for testing
export const createInvalidFile = (name: string = 'test.txt') =>
  createMockFile(name, 300, 'text/plain');

// Large file for size validation testing
export const createLargeFile = (name: string = 'large.js') =>
  createMockFile(name, 15 * 1024 * 1024, 'text/javascript'); // 15MB

// Mock feedback data
export const createMockFeedback = (overrides: Partial<{
  content: string;
  rating: number;
  category: 'bug' | 'feature' | 'improvement';
}> = {}) => ({
  content: 'This is a test feedback message for testing purposes.',
  rating: 4,
  category: 'feature' as const,
  ...overrides,
});

// Mock translation response
export const createMockTranslationResponse = (overrides: any = {}) => ({
  id: 'test-translation-id',
  interpretation: 'The user wants to improve the component styling.',
  changes: [
    {
      type: 'css' as const,
      before: 'const styles = {};',
      after: 'const styles = { margin: "1rem" };',
      explanation: 'Added margin for better spacing',
    },
  ],
  confidence: 0.85,
  reasoning: 'Based on the feedback requesting better spacing.',
  ...overrides,
});

// Mock user data
export const createMockUser = (overrides: any = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  image: null,
  ...overrides,
});

// Mock tRPC response wrapper
export const createMockTRPCResponse = <T>(data: T) => ({
  data,
  success: true,
  message: 'Success',
  timestamp: new Date().toISOString(),
});
