'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface TextReelContextType {
  isShowing: boolean;
  setIsShowing: (value: boolean) => void;
}

const TextReelContext = createContext<TextReelContextType | undefined>(undefined);

export function TextReelProvider({ children }: { children: ReactNode }) {
  const [isShowing, setIsShowing] = useState(false);

  return (
    <TextReelContext.Provider value={{ isShowing, setIsShowing }}>
      {children}
    </TextReelContext.Provider>
  );
}

export function useTextReelVisibility() {
  const context = useContext(TextReelContext);
  if (context === undefined) {
    throw new Error('useTextReelVisibility must be used within TextReelProvider');
  }
  return context;
}
