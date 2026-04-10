'use client';

import { FC, useTransition } from 'react';
import { Edit, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: 'write' | 'upload';
  route: string;
  className?: string;
}

const QuickActionCard: FC<QuickActionCardProps> = ({ title, description, icon, route, className }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const IconComponent = icon === 'write' ? Edit : Upload;

  return (
    <button
      onClick={() => startTransition(() => router.push(route))}
      disabled={isPending}
      className={cn(
        "group relative flex flex-col items-start p-8 rounded-2xl border-2 transition-all duration-300",
        "bg-white dark:bg-brand-black-90 border-gray-200 dark:border-gray-500",
        "hover:border-black dark:hover:border-white hover:shadow-xl",
        "transform hover:-translate-y-1 active:translate-y-0",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {/* Icon Container */}
      <div className="mb-4 p-4 rounded-xl bg-gray-100 dark:bg-brand-black-80 group-hover:bg-black dark:group-hover:bg-white transition-colors duration-300">
        <IconComponent className="w-8 h-8 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300" />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold mb-2 text-black dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-left">
        {description}
      </p>

      {/* Hover Arrow */}
      <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <svg
          className="w-6 h-6 text-black dark:text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
};

const QuickActions: FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <QuickActionCard
        title="Write"
        description="Start writing a new article with our powerful editor"
        icon="write"
        route="/editor"
      />
      <QuickActionCard
        title="Upload"
        description="Upload your existing article or document"
        icon="upload"
        route="/blogup"
      />
    </div>
  );
};

export default QuickActions;
