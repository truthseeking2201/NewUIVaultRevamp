import React, { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslatedSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

/**
 * A component that wraps its children with translation capabilities.
 * This is useful for sections of content that need to be translated.
 */
export function TranslatedSection({ children, id, className }: TranslatedSectionProps) {
  const { isEnglish, translateText } = useLanguage();

  // Function to recursively translate text nodes while preserving React elements
  const translateChildren = (children: ReactNode): ReactNode => {
    // Handle string children (text nodes)
    if (typeof children === 'string') {
      return isEnglish ? translateText(children) : children;
    }

    // Handle arrays of children
    if (Array.isArray(children)) {
      return children.map((child, index) => (
        <React.Fragment key={index}>
          {translateChildren(child)}
        </React.Fragment>
      ));
    }

    // Handle React elements
    if (React.isValidElement(children)) {
      // Clone the element with translated children
      return React.cloneElement(
        children,
        { ...children.props },
        translateChildren(children.props.children)
      );
    }

    // Return as is for other types (null, undefined, numbers, etc.)
    return children;
  };

  return (
    <div id={id} className={className}>
      {translateChildren(children)}
    </div>
  );
}

/**
 * A higher-order component that wraps a component with translation capabilities.
 */
export function withTranslatedSection<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => (
    <TranslatedSection>
      <Component {...props} />
    </TranslatedSection>
  );
}
