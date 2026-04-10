'use client'
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { strapiAPI } from '@/lib/api';
import { getFontClass, getfontsizeBN } from '@/lib/fonts';

interface BannerData {
  id: number;
  Active: boolean;
  headline: string;
  postTitle: string;
  subtitle: string;
  postUrl: string;
  EndDate?: string;
}

const FloatingBanner = () => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndSetBannerData = async () => {
      try {
        const response = await strapiAPI.getBannerContent();
        const data: BannerData = response.data;

        if (data) {
          setBannerData(data);

          const dismissedUntilValue = localStorage.getItem('bannerDismissedUntil');

          if (!dismissedUntilValue) {
            localStorage.setItem('bannerDismissedUntil', '0');
          }

          const now = Date.now();

          let isDismissed = false;
          if (dismissedUntilValue) {
            const expiry = parseInt(dismissedUntilValue, 10);
            if(expiry > now) {
              isDismissed = true;
            }
          }
          const isExpired = data.EndDate ? new Date() > new Date(data.EndDate) : false;


          if (data.Active && !isExpired && !isDismissed) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error("Error fetching banner data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetBannerData();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Set expiry to 12 hours from now
    const expiry = Date.now() + 12 * 60 * 60 * 1000;
    localStorage.setItem('bannerDismissedUntil', expiry.toString());
  };

  if (isLoading || !isVisible || !bannerData) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed z-50 md:right-6 md:bottom-6 md:max-w-lg md:min-w-[350px] bottom-0 right-0 md:p-0 transition-all duration-300 ease-in-out"
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
              {/* <div className="relative h-1 w-full bg-brand-accent/20">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-brand-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5 }}
                />
              </div> */}

              <CardHeader className="p-4 pb-2 pt-3">
                <div className="flex justify-between items-start">
                  <CardDescription className={`${getfontsizeBN(bannerData.headline, 'text-xs')} font-medium text-foreground animate-pulse ${getFontClass(bannerData.headline)}`}>
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
                <CardTitle className={`${getfontsizeBN(bannerData.postTitle, 'text-base')} mt-2 font-bold ${getFontClass(bannerData.postTitle)}`}>
                  {bannerData.postTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 pb-2">
                <p className={`${getfontsizeBN(bannerData.subtitle, 'text-xs')} text-foreground/90 ${getFontClass(bannerData.subtitle)}`}>
                  {bannerData.subtitle}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-2 pb-4">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full text-sm bg-brand-accent/80 hover:bg-brand-accent border border-foreground dark:border-neutral-100 text-black font-black tracking-wider shadow-md transition-all duration-300 hover:shadow-lg"
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
                    <span className={getFontClass("Read")}>Read</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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