'use client'
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { bannerData } from '@/data/dummy-data';
import { motion, AnimatePresence } from "framer-motion";

const FloatingBanner = () => {
  const [isVisible, setIsVisible] = useState(true);



  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('bannerDismissed', 'true');
    
    // Reset dismissal after 24 hours
    setTimeout(() => {
      localStorage.removeItem('bannerDismissed');
    }, 24 * 60 * 60 * 1000);
  };

  if (!bannerData?.isActive || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed z-50 md:right-6 md:bottom-6 md:max-w-sm w-full md:w-auto bottom-0 right-0 md:p-0 transition-all duration-300 ease-in-out"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Card className="border-2 border-brand-accent shadow-lg overflow-hidden rounded-lg">
              {/* Progress bar now positioned inside the border */}
              <div className="relative h-1 w-full bg-brand-accent/20">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-brand-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                />
              </div>
              
              <CardHeader className="p-4 pb-2 pt-3">
                <div className="flex justify-between items-start">
                  <CardDescription className="text-xs font-medium text-brand-accent animate-pulse">
                    {bannerData.headline}
                  </CardDescription>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full -mt-1 -mr-1" 
                    onClick={handleDismiss}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Dismiss</span>
                  </Button>
                </div>
                <CardTitle className="text-base mt-2 font-bold">
                  {bannerData.postTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 pb-2">
                <p className="text-xs text-muted-foreground">
                  {bannerData.subtitle}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-2 pb-4">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full text-sm bg-brand-accent hover:bg-brand-accent/90 text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg"
                  onClick={() => window.location.href = bannerData.postUrl}
                >
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "mirror", 
                      duration: 1.5,
                      repeatDelay: 2
                    }}
                    className="flex items-center"
                  >
                    Read Post
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.span>
                </Button>
              </CardFooter>
            </Card>
            <motion.div 
              className="absolute -inset-0.5 bg-gradient-to-r from-brand-accent to-brand-accent/50 opacity-75 blur-sm rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror",
                repeatDelay: 5
              }}
              style={{ zIndex: -1 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingBanner;