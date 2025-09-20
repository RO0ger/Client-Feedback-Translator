'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUpload } from '@/components/upload/file-upload';
import { FeedbackForm } from '@/components/forms/feedback-form';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import {
  createAnalysisSchema,
  fileUploadSchema,
} from '@/lib/validations/analysis';
import { HistorySidebar } from '@/components/history/history-sidebar';

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
      <div className="min-h-screen">
        <div className="container max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
              Client Feedback Translator
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload your React component, provide client feedback, and get
              actionable code changes instantly.
            </p>
          </div>

          <form onSubmit={handleSubmit(handleAnalysis)}>
            <div className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-10 space-y-12">
              <section>
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">
                  1. Upload Component
                </h2>
                <FileUpload
                  name="fileUpload"
                  schema={fileUploadSchema}
                  disabled={createAnalysis.isLoading || isSubmitting}
                />
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">
                  2. Provide Feedback
                </h2>
                <FeedbackForm
                  disabled={createAnalysis.isLoading || isSubmitting}
                  isLoading={createAnalysis.isLoading || isSubmitting}
                />
              </section>
            </div>
          </form>
        </div>
        <HistorySidebar />
      </div>
    </FormProvider>
  );
}
