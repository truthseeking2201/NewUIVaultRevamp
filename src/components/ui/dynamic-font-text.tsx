import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

// Type for font size breakpoints
type FontBreakpoint = {
  minLength: number;
  fontSize: string;
};

// Component for dynamic font sizing based on content length
export const DynamicFontText = ({
  children,
  maxWidth = 200,
  className,
  breakpoints = [
    { minLength: 0, fontSize: "text-lg" },
    { minLength: 15, fontSize: "text-base" },
    { minLength: 20, fontSize: "text-sm" },
  ],
  defaultFontSize = "text-lg",
}: {
  children: React.ReactNode;
  maxWidth?: number;
  className?: string;
  breakpoints?: FontBreakpoint[];
  defaultFontSize?: string;
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(defaultFontSize);

  useEffect(() => {
    if (textRef.current && children) {
      const text = String(children);
      const textLength = text.length;

      // Sort breakpoints by minLength in descending order to find the appropriate font size
      const sortedBreakpoints = [...breakpoints].sort(
        (a, b) => b.minLength - a.minLength
      );

      // Find the first breakpoint where text length meets the minimum requirement
      const matchingBreakpoint = sortedBreakpoints.find(
        (breakpoint) => textLength >= breakpoint.minLength
      );

      setFontSize(matchingBreakpoint?.fontSize || defaultFontSize);
    }
  }, [children, breakpoints, defaultFontSize]);

  return (
    <span
      ref={textRef}
      className={cn(`font-bold break-all`, fontSize, className)}
      style={{ maxWidth: `${maxWidth}px` }}
    >
      {children}
    </span>
  );
};
