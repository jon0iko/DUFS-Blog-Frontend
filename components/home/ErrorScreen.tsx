'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorScreen({
  title = 'Unable to Load',
  message = 'We encountered a connection problem. Please try again later.',
  onRetry,
  showRetry = true,
}: ErrorScreenProps) {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Error Icon */}
          <motion.div
            className="mb-8 flex justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="p-4 rounded-full bg-red-100/10 border border-red-500/20">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {title}
          </motion.h2>

          {/* Message */}
          <motion.p
            className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {message}
          </motion.p>

          {/* Retry Button */}
          {showRetry && onRetry && (
            <motion.button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
