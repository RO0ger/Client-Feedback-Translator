'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/upload/file-upload';
import { FeedbackForm } from '@/components/forms/feedback-form';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const createAnalysis = trpc.analysis.create.useMutation({
    onSuccess: (result) => {
      toast.success('Analysis complete!');
      router.push(`/results/${result.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAnalysis = async (feedback: string) => {
    if (!selectedFile) return;

    const fileContent = await selectedFile.text();

    await createAnalysis.mutateAsync({
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      originalContent: fileContent,
      feedback,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Client Feedback Translator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your React component, provide client feedback, and get actionable code changes instantly.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              1. Upload Component
            </h2>
            <FileUpload onFileAccept={setSelectedFile} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              2. Provide Feedback
            </h2>
            <FeedbackForm
              onSubmit={handleAnalysis}
              disabled={!selectedFile || createAnalysis.isLoading}
              isLoading={createAnalysis.isLoading}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
