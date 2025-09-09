'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUpload } from '@/components/upload/file-upload';
import { FeedbackForm } from '@/components/forms/feedback-form';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { createAnalysisSchema } from '@/lib/validations/analysis';

type AnalysisFormData = z.infer<typeof createAnalysisSchema>;

export default function DashboardPage() {
  const router = useRouter();
  const methods = useForm<AnalysisFormData>({
    resolver: zodResolver(createAnalysisSchema),
    defaultValues: {
      fileUpload: null,
      feedback: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const createAnalysis = trpc.analysis.create.useMutation({
    onSuccess: (result) => {
      toast.success('Analysis complete!');
      if (result) {
        router.push(`/results/${result.id}`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAnalysis = async (data: AnalysisFormData) => {
    const { fileUpload, feedback } = data;
    if (!fileUpload?.file) return;

    await createAnalysis.mutateAsync({
      fileName: fileUpload.file.name,
      fileSize: fileUpload.file.size,
      originalContent: fileUpload.content,
      feedback,
    });
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Client Feedback Translator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your React component, provide client feedback, and get
              actionable code changes instantly.
            </p>
          </div>

          <form onSubmit={handleSubmit(handleAnalysis)} className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                1. Upload Component
              </h2>
              <FileUpload
                name="fileUpload"
                disabled={createAnalysis.isLoading || isSubmitting}
              />
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                2. Provide Feedback
              </h2>
              <FeedbackForm
                onSubmit={() => {}} // Now handled by the main form
                disabled={createAnalysis.isLoading || isSubmitting}
                isLoading={createAnalysis.isLoading || isSubmitting}
              />
            </section>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
