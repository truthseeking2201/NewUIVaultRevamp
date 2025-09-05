import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from '@/hooks/use-translation';

type LanguageContextType = ReturnType<typeof useTranslation>;

// Create the context with default values
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Language Provider component that provides translation functionality to the app
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const translation = useTranslation();

  return (
    <LanguageContext.Provider value={translation}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Custom hook to use the language context
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
