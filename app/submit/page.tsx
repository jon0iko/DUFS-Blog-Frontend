'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';
import BlogSubmissionForm from '@/components/submissions/BlogSubmissionForm';
// import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"


export default function SubmitPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      {isAuthenticated && (
        <div className="container py-12 px-4">
          <h1 className="text-4xl font-bold mb-8 text-center">Submit Your Article</h1>
          <BlogSubmissionForm />
        </div>
      )}
    </>
  );
}