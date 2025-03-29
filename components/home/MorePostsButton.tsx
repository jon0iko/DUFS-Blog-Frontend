// File: src/components/home/MorePostsButton.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MorePostsButton() {
  return (
    <div className="flex justify-center py-8">
      <Button 
        asChild
        className="bg-brand-accent hover:bg-brand-accent/90 text-white rounded px-8 py-2 uppercase text-sm font-medium"
      >
        <Link href="/articles">
          More Posts
        </Link>
      </Button>
    </div>
  );
}