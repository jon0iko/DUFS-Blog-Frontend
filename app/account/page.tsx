'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';
import AccountProfile from '@/components/auth/AccountProfile';

export default function AccountPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      {isAuthenticated && (
        <div className="container max-w-3xl mx-auto py-12 px-4">
          <AccountProfile />
        </div>
      )}
    </>
  );
}