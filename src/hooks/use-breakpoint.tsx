import { useState, useEffect } from 'react';

// Standard breakpoints matching Tailwind's default
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type BreakpointKey = keyof typeof breakpoints;

/**
 * Custom hook for responsive design
 * @returns An object with boolean flags for each breakpoint and up
 * @example
 * const { isMd, isLg } = useBreakpoint();
 * // isMd will be true if viewport width >= 768px
 * // isLg will be true if viewport width >= 1024px
 */
export function useBreakpoint() {
  // Initial state based on window width
  const [windowSize, setWindowSize] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize(window.innerWidth);
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures this effect runs only on mount and unmount

  // Create boolean flags for each breakpoint
  const breakpointValues = {} as Record<`is${Capitalize<BreakpointKey>}`, boolean>;

  (Object.keys(breakpoints) as BreakpointKey[]).forEach((breakpoint) => {
    const capitalizedKey = breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1);
    breakpointValues[`is${capitalizedKey}` as `is${Capitalize<BreakpointKey>}`] =
      windowSize >= breakpoints[breakpoint];
  });

  // Add a specific flag for mobile (under md breakpoint)
  const isMobile = windowSize < breakpoints.md;

  return {
    ...breakpointValues,
    isMobile,
    windowWidth: windowSize,
  };
}

export default useBreakpoint;
