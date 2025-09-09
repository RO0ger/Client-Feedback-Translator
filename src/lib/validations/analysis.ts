import { z } from 'zod';

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File must be less than 10MB')
    .refine(file => /\.(tsx|jsx|js|ts)$/.test(file.name), 'Must be a JavaScript/TypeScript file')
    .refine(file => file.type.includes('text') || file.name.match(/\.(tsx|jsx)$/), 'Invalid file type'),
});

export const feedbackSchema = z.object({
  feedback: z.string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(2000, 'Feedback cannot exceed 2000 characters')
    .refine(text => text.trim().length > 0, 'Feedback cannot be empty'),
});

export const createAnalysisSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  originalContent: z.string().min(1),
  feedback: z.string().min(10).max(2000),
});
