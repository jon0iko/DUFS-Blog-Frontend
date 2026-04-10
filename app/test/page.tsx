// test loadingscreen animation
import React from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function TestPage() {
  return (
    <div className="h-screen w-screen">
      <LoadingScreen isLoading={true}/>
    </div>
  );
}