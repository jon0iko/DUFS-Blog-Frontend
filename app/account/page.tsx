'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';
import AccountProfile from '@/components/auth/AccountProfile';

export default function AccountPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      startTransition(() => {
        router.push('/auth/signin');
      });
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <>
      <LoadingScreen isLoading={isLoading || isPending} />
      {isAuthenticated && (
        <div className="container max-w-3xl mx-auto py-12 px-4">
          <AccountProfile />
        </div>
      )}
    </>
  );
}