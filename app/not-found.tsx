'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center  relative overflow-hidden">

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 sm:px-8 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* 404 Number */}
        <motion.div
          className="mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isVisible ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="font-bold text-9xl bg-foreground sm:text-[180px] bg-clip-text text-transparent leading-none">
            404
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          className=" font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Page Not Found
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-muted-foreground text-lg sm:text-xl mb-8 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          We couldn't find the page you're looking for.<br/> It might have been moved or removed.
        </motion.p>

        {/* Secondary message */}
        <motion.p
          className="text-base text-muted-foreground mb-12"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          But don't worry, there's plenty of great content waiting for you.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-brand-black text-brand-black bg-white hover:bg-brand-black hover:text-white font-semibold transition-all duration-300"
            >
              Back to Home
            </Button>
          </Link>

          <Link href="/browse" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-brand-black text-brand-black bg-white hover:bg-brand-black hover:text-white font-semibold transition-all duration-300"
            >
              Browse Articles
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
