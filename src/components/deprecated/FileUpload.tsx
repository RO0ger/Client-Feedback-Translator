'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileAccepted: (file: File, content: string) => void;
}

export function FileUpload({ onFileAccepted }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      toast.error('File rejected', {
        description: rejectedFiles[0].errors[0].message,
      });
      return;
    }

    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadedFile(file);
      setFileContent(content);
      onFileAccepted(file, content);
    };

    reader.readAsText(file);
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/jsx': ['.jsx'],
      'text/tsx': ['.tsx'],
    },
    maxSize: 100 * 1024, // 100KB
  });

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileContent('');
  };

  return (
    <section className="w-full">
      {uploadedFile ? (
        <div className="relative flex items-center gap-4 rounded-lg border bg-muted/20 p-4">
          <FileIcon className="h-10 w-10 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">{uploadedFile.name}</span>
            <span className="text-sm text-muted-foreground">
              {(uploadedFile.size / 1024).toFixed(2)} KB
            </span>
          </div>
          <button
            onClick={handleRemoveFile}
            className="absolute right-2 top-2 rounded-full p-1 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors',
            isDragActive
              ? 'border-solid border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <div
            className={cn(
              'flex flex-col items-center gap-2 text-muted-foreground transition-colors',
              isDragActive && 'text-primary'
            )}
          >
            <UploadCloud className="h-12 w-12" />
            <p className="font-bold">Drag & drop your component file here</p>
            <p className="text-sm">.jsx or .tsx, up to 100KB</p>
          </div>
        </div>
      )}
    </section>
  );
}
