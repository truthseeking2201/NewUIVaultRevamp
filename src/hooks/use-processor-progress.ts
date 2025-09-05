import { useState, useEffect } from 'react';

export type ProcessorState = 'idle' | 'analyzing' | 'optimizing' | 'complete' | 'error';

interface UseProcessorProgressOptions {
  initialState?: ProcessorState;
  initialProgress?: number;
  speed?: number;
  onComplete?: () => void;
}

/**
 * Custom hook to manage AI processor progress simulation
 * This hook provides a more resilient and optimized way to handle processor state and progress
 */
export function useProcessorProgress({
  initialState = 'analyzing',
  initialProgress = 0,
  speed = 1,
  onComplete
}: UseProcessorProgressOptions = {}) {
  const [state, setState] = useState<ProcessorState>(initialState);
  const [progress, setProgress] = useState(initialProgress);

  // Simulate processor progress
  useEffect(() => {
    // Skip if not in active state
    if (state === 'idle' || state === 'complete' || state === 'error') {
      return;
    }

    // Use a setInterval with reasonable timing
    const interval = setInterval(() => {
      setProgress(prev => {
        // Calculate new progress with consistent increments
        // Use larger steps to reduce number of state updates
        const increment = (2 + (Math.random() * 3)) * speed;
        const newProgress = Math.min(100, prev + increment);

        // Handle completion
        if (newProgress >= 100) {
          setState('complete');
          if (onComplete) {
            onComplete();
          }
          return 100;
        }

        // Transition from analyzing to optimizing at halfway point
        // Only do this once for better performance
        if (newProgress > 50 && prev <= 50 && state === 'analyzing') {
          setState('optimizing');
        }

        return newProgress;
      });
    }, 500); // Use a reasonable interval to reduce CPU usage

    // Cleanup
    return () => clearInterval(interval);
  }, [state, speed, onComplete]);

  // Function to reset or restart the processor
  const restart = () => {
    setState('analyzing');
    setProgress(0);
  };

  // Function to simulate error
  const simulateError = () => {
    setState('error');
  };

  return {
    state,
    progress,
    restart,
    simulateError,
    setState,
    setProgress,
    isComplete: state === 'complete',
    isError: state === 'error',
    isProcessing: state === 'analyzing' || state === 'optimizing'
  };
}
