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
        <div className="container mx-auto max-w-5xl px-6 py-12 md:px-8 md:py-16">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white text-glow md:text-6xl">
              Client Feedback Translator
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-300 md:text-2xl leading-relaxed">
              Upload your React component, provide client feedback, and get
              actionable code changes instantly.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(handleAnalysis)} data-testid="analysis-form">
            <motion.div
              className="space-y-12 rounded-3xl modern-glass p-8 premium-shadow md:p-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <section data-testid="upload-section">
                <h2 className="mb-8 text-3xl font-bold text-white text-glow md:text-4xl">
                  1. Upload Component
                </h2>
                <FileUpload
                  name="fileUpload"
                  schema={fileUploadSchema}
                  disabled={createAnalysis.isPending || isSubmitting}
                />
              </section>

              <section data-testid="feedback-section">
                <h2 className="mb-8 text-3xl font-bold text-white text-glow md:text-4xl">
                  2. Provide Feedback
                </h2>
                <FeedbackForm
                  disabled={createAnalysis.isPending || isSubmitting}
                  isLoading={createAnalysis.isPending || isSubmitting}
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
