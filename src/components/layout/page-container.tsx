import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import ConditionRenderer from "../shared/condition-renderer";
import useBreakpoint from "@/hooks/use-breakpoint";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  backgroundImage?: string;
}

export function PageContainer({
  children,
  className = "",
  backgroundImage = "",
}: PageContainerProps) {
  const [isReady, setIsReady] = useState(false);
  const { isSm } = useBreakpoint();
  // Use requestAnimationFrame for smooth content appearance
  useEffect(() => {
    // Use requestAnimationFrame to delay content appearance until browser is ready to paint
    // This helps prevent layout shifts and jank during initial render
    const raf = requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  if (backgroundImage) {
    return (
      <ConditionRenderer when={!!backgroundImage} duration={0.5}>
        <div
          className="min-h-screen w-full"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "top",
            backgroundRepeat: "no-repeat",
          }}
        >
          <main
            className={cn(
              "flex-1 transition-opacity duration-300",
              isReady ? "opacity-100" : "opacity-0",
              isSm ? "container mx-auto" : "px-4",
              className
            )}
          >
            {children}
          </main>
        </div>
      </ConditionRenderer>
    );
  }

  return (
    <main
      className={cn(
        "flex-1 transition-opacity duration-300",
        isReady ? "opacity-100" : "opacity-0",
        isSm ? "container mx-auto" : "px-4",
        className
      )}
    >
      {children}
    </main>
  );
}
