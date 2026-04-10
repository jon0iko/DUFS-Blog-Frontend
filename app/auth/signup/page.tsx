'use client';

import React, { Suspense } from 'react';
import SignUp from '@/components/auth/SignUp';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="w-full h-96" />}>
      <SignUp />
    </Suspense>
  );
}