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
import { motion } from 'framer-motion';

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
        <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Client Feedback Translator
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 md:text-xl">
              Upload your React component, provide client feedback, and get
              actionable code changes instantly.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(handleAnalysis)}>
            <motion.div
              className="space-y-12 rounded-2xl border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur-lg md:p-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <section>
                <h2 className="mb-6 text-2xl font-semibold text-gray-900 md:text-3xl">
                  1. Upload Component
                </h2>
                <FileUpload
                  name="fileUpload"
                  schema={fileUploadSchema}
                  disabled={createAnalysis.isLoading || isSubmitting}
                />
              </section>

              <section>
                <h2 className="mb-6 text-2xl font-semibold text-gray-900 md:text-3xl">
                  2. Provide Feedback
                </h2>
                <FeedbackForm
                  disabled={createAnalysis.isLoading || isSubmitting}
                  isLoading={createAnalysis.isLoading || isSubmitting}
                />
              </section>
            </motion.div>
          </form>
        </div>
        <HistorySidebar />
      </div>
    </FormProvider>
  );
}
