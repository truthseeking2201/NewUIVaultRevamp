import React, { ReactNode } from "react";
import { getEnglishText, translateViToEn } from "@/utils/translations";

interface TranslatedTextProps {
  id?: string;       // Translation ID from our translations dictionary
  children?: ReactNode; // Fallback or custom content
  text?: string;     // Text to translate directly
  className?: string; // Optional className for styling
}

/**
 * TranslatedText component that handles translations from Vietnamese to English
 *
 * Usage:
 * 1. With ID: <TranslatedText id="lichSuHieuSuat" />
 * 2. With direct text: <TranslatedText text="Lịch sử hiệu suất" />
 * 3. With children as fallback: <TranslatedText id="someKey">Fallback Text</TranslatedText>
 */
export function TranslatedText({ id, children, text, className }: TranslatedTextProps) {
  // If ID is provided, look up translation
  if (id) {
    const translatedText = getEnglishText(id);
    return <span className={className}>{translatedText}</span>;
  }

  // If text is provided, translate it
  if (text) {
    const translatedText = translateViToEn(text);
    return <span className={className}>{translatedText}</span>;
  }

  // Default case: return children
  return <span className={className}>{children}</span>;
}

/**
 * A higher-order component that wraps a component and translates all of its text props
 */
export function withTranslation<P extends object>(
  Component: React.ComponentType<P>,
  textProps: string[] = ["title", "description", "label", "text", "placeholder"]
): React.FC<P> {
  return (props: P) => {
    const translatedProps = { ...props };

    // Translate all specified text props
    textProps.forEach(propName => {
      if (propName in props && typeof props[propName as keyof P] === 'string') {
        const textValue = props[propName as keyof P] as unknown as string;
        (translatedProps as any)[propName] = translateViToEn(textValue);
      }
    });

    return <Component {...translatedProps} />;
  };
}
