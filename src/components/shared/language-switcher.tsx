import React from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

/**
 * Language Switcher component that allows users to toggle between Vietnamese and English
 */
export function LanguageSwitcher({ className = '', variant = 'default' }: LanguageSwitcherProps) {
  const { language, toggleLanguage } = useLanguage();

  // Minimal variant just shows the icon and language code
  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className={`flex items-center gap-1 text-white/70 hover:text-white ${className}`}
        title={language === 'en' ? 'Switch to Vietnamese' : 'Switch to English'}
      >
        <Globe size={14} />
        <span className="uppercase text-xs font-medium">{language}</span>
      </Button>
    );
  }

  // Default variant is more descriptive
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={`flex items-center gap-2 ${className}`}
    >
      <Globe size={16} />
      <span>
        {language === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
      </span>
    </Button>
  );
}
