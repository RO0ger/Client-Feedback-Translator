import { z } from 'zod';

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  content: z.string().min(1, 'File content cannot be empty.'),
  fileName: z
    .string()
    .min(1, 'File name cannot be empty.')
    .refine(
      (name) => {
        const extension = name.split('.').pop()?.toLowerCase();
        return !!extension && ['js', 'jsx', 'ts', 'tsx'].includes(extension);
      },
      {
        message: 'File type must be .js, .jsx, .ts, or .tsx.',
      }
    ),
  fileSize: z.number().positive('File size must be positive.'),
});

export const feedbackSchema = z.object({
  feedback: z
    .string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(2000, 'Feedback cannot exceed 2000 characters')
    .refine((text) => text.trim().length > 0, 'Feedback cannot be empty'),
});

export const createAnalysisSchema = z.object({
  fileUpload: fileUploadSchema.nullable().refine((val) => val, {
    message: 'A component file is required.',
  }),
  feedback: z.string().min(10, {
    message: 'Feedback must be at least 10 characters.',
  }),
});