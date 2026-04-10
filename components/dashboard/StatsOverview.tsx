'use client';

import { FC } from 'react';
import { Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: 'views' | 'likes' | 'comments' | 'articles';
}

const StatCard: FC<StatCardProps> = ({ title, value, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case 'views':
        return <Eye className="w-5 h-5" />;
      case 'likes':
        return <Heart className="w-5 h-5" />;
      case 'comments':
        return <MessageCircle className="w-5 h-5" />;
      case 'articles':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-brand-black-90 border border-gray-200 dark:border-gray-500 rounded-xl p-6 transition-all duration-300 shadow-lg dark:shadow-white/10 hover:shadow-xl hover:dark:shadow-white/20">
      <div className="flex items-center justify-between">  
        <div className="flex flex-col gap-2 items-start">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-brand-black-80 inline-flex items-center justify-center">
            <div className="text-black dark:text-white">{getIcon()}</div>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{title}</p>
          </div>
        </div>
        <div>
          <p className="text-4xl font-bold text-black dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface StatsOverviewProps {
  stats: {
    totalArticles: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  };
}

const StatsOverview: FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Articles"
        value={stats.totalArticles}
        icon="articles"
      />
      <StatCard
        title="Total Views"
        value={stats.totalViews.toLocaleString()}
        icon="views"
      />
      <StatCard
        title="Total Likes"
        value={stats.totalLikes.toLocaleString()}
        icon="likes"
      />
      <StatCard
        title="Total Comments"
        value={stats.totalComments.toLocaleString()}
        icon="comments"
      />
    </div>
  );
};

export default StatsOverview;
