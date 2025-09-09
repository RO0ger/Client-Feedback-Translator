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
import { z } from 'zod';

interface FileUploadProps {
  name: string;
  disabled?: boolean;
  className?: string;
  schema: z.ZodType<any, any>;
}

export function FileUpload({
  name,
  disabled = false,
  className,
  schema,
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
            message = 'File must be less than 10MB.';
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
      } catch (error) {
        setError(name, {
          type: 'manual',
          message: 'Failed to process file.',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [disabled, name, setError, clearErrors, setValue, schema]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      // Remove accept to allow all files - we'll validate with schema instead
      maxSize: 10 * 1024 * 1024, // 10MB
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
        className={cn(
          'relative cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all duration-200 backdrop-blur-sm',
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
        <input {...getInputProps()} data-testid="file-upload-input" />
        <AnimatePresence mode="wait">
          {errorMessage ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-700 mb-2">
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
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-spin" />
              <p className="text-lg font-medium text-blue-700">
                Processing File...
              </p>
            </motion.div>
          ) : hasFile ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
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
              <Upload className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <p className="text-xl font-semibold text-gray-900 mb-3">
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
