// File: src/components/home/MorePostsButton.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MorePostsButton() {
  return (
    <div className="flex justify-center pb-8">
      <Button 
        asChild
        className="bg-brand-accent/90 hover:bg-brand-accent text-white rounded-full shadow-lg px-8 py-2 uppercase text-sm font-normal"
      >
        <Link href="/articles">
          More Posts
        </Link>
      </Button>
    </div>
  );
}