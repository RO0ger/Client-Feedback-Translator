'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fileUploadSchema } from '@/lib/validations/analysis';
import { z } from 'zod';

interface FileUploadProps {
  name: string;
  disabled?: boolean;
  className?: string;
  schema: z.ZodType<any, any>;
  onFileUpload?: (fileData: { file: File; content: string; fileName: string; fileSize: number }) => void;
  maxSize?: number;
}

export function FileUpload({
  name,
  disabled = false,
  className,
  schema,
  onFileUpload,
  maxSize,
}: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (disabled) return;

      clearErrors(name);
      setUploadedFile(null);

      // Handle files rejected by dropzone
      if (rejectedFiles.length > 0) {
        const firstError = rejectedFiles[0].errors[0];
        let message = 'File upload error.';
        
        if (firstError) {
          if (firstError.code === 'file-too-large') {
            message = `File must be less than ${maxSize ? maxSize / (1024 * 1024) : 10}MB.`;
          } else if (firstError.code === 'file-invalid-type') {
            // Use the specific schema error message for file type validation
            message = 'File type must be .js, .jsx, .ts, or .tsx.';
          } else {
            message = firstError.message;
          }
        }
        setError(name, { type: 'manual', message });
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setIsProcessing(true);
      try {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsText(file);
        });

        const fileData = {
          file,
          content,
          fileName: file.name,
          fileSize: file.size,
        };

        const validation = schema.safeParse(fileData);
        if (!validation.success) {
          setError(name, {
            type: 'manual',
            message: validation.error.errors[0].message,
          });
          setIsProcessing(false);
          return;
        }

        setValue(name, fileData, { shouldValidate: true });
        setUploadedFile(file);
        if (onFileUpload) {
          onFileUpload(fileData);
        }
      } catch (error) {
        setError(name, {
          type: 'manual',
          message: 'Failed to process file.',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [disabled, name, setError, clearErrors, setValue, schema, onFileUpload, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      // Remove accept to allow all files - we'll validate with schema instead
      maxSize: maxSize || (10 * 1024 * 1024), // Default to 10MB if not provided
      multiple: false,
      disabled: disabled || isProcessing,
      // Validate files manually in onDrop instead of using accept
      validator: (file) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !['js', 'jsx', 'ts', 'tsx'].includes(extension)) {
          return {
            code: 'file-invalid-type',
            message: 'File type must be .js, .jsx, .ts, or .tsx.'
          };
        }
        return null;
      }
    });

  const removeFile = () => {
    setUploadedFile(null);
    setValue(name, null, { shouldValidate: false });
    clearErrors(name);
  };

  const errorMessage = errors[name]?.message as string;
  const hasFile = !!uploadedFile;

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        data-testid="dropzone"
        className={cn(
          'relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 backdrop-blur-sm md:p-8',
          {
            'border-blue-400 bg-blue-50/50 scale-[1.02]':
              isDragActive && !isDragReject && !disabled,
            'border-red-400 bg-red-50/50': isDragReject || !!errorMessage,
            'border-green-400 bg-green-50/50': hasFile && !errorMessage,
            'cursor-not-allowed bg-gray-100/50 opacity-50': disabled,
            'border-gray-300 bg-white/50 hover:border-gray-400 hover:bg-gray-50/50':
              !hasFile && !errorMessage && !isDragActive,
          }
        )}
      >
        <input {...getInputProps()} data-testid="file-upload-input" disabled={disabled || isProcessing} />
        <AnimatePresence mode="wait">
          {errorMessage ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500 md:h-12 md:w-12" />
              <p className="mb-2 text-base font-medium text-red-700 md:text-lg">
                Upload Error
              </p>
              <p className="text-sm text-red-600">{errorMessage}</p>
            </motion.div>
          ) : isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-500 md:h-12 md:w-12" />
              <p className="text-base font-medium text-blue-700 md:text-lg">
                Processing File...
              </p>
            </motion.div>
          ) : hasFile ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center gap-4 text-center md:flex-row md:justify-between md:text-left"
            >
              <div className="flex flex-col items-center gap-4 md:flex-row">
                <CheckCircle2 className="h-10 w-10 text-green-600 md:h-12 md:w-12" />
                <div>
                  <p className="font-medium text-gray-900 md:text-lg">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Remove file"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                disabled={disabled}
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Upload className="mx-auto mb-6 h-12 w-12 text-gray-400 md:h-16 md:w-16" />
              <p className="mb-3 text-lg font-semibold text-gray-900 md:text-xl">
                {isDragActive
                  ? 'Drop your file here'
                  : 'Upload your React component'}
              </p>
              <p className="text-gray-500">Drag & drop or click to browse</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
