'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BlogSubmissionForm from '@/components/submissions/BlogSubmissionForm';

export default function SubmitPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div className="container py-12 text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Submit Your Article</h1>
      <BlogSubmissionForm />
    </div>
  );
}