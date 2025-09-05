import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useState, useEffect, createContext, useContext } from "react";

import { cn } from "@/lib/utils";
import { isMobileDevice } from "@/utils/helpers";

const TooltipProvider = TooltipPrimitive.Provider;

// Context to manage mobile tooltip state
const MobileTooltipContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

// Enhanced Tooltip with mobile support
const Tooltip = ({
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = isMobileDevice();

  // Close tooltip when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target as Element;
      if (!target.closest("[data-mobile-tooltip]")) {
        setIsOpen(false);
      }
    };

    // Small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobile, isOpen]);

  // On mobile, use controlled state
  const tooltipProps = isMobile
    ? { open: isOpen, onOpenChange: setIsOpen }
    : props;

  return (
    <MobileTooltipContext.Provider value={{ isOpen, setIsOpen }}>
      <TooltipPrimitive.Root {...tooltipProps}>
        <div data-mobile-tooltip>{children}</div>
      </TooltipPrimitive.Root>
    </MobileTooltipContext.Provider>
  );
};

const TooltipTrigger = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>) => {
  const isMobile = isMobileDevice();
  const mobileContext = useContext(MobileTooltipContext);

  const handleMobileTouch = (e: React.TouchEvent | React.MouseEvent) => {
    if (isMobile && mobileContext) {
      e.preventDefault();
      e.stopPropagation();
      mobileContext.setIsOpen(!mobileContext.isOpen);
    }
  };

  return (
    <TooltipPrimitive.Trigger
      {...props}
      onTouchEnd={(e) => {
        if (isMobile) {
          handleMobileTouch(e);
        }
        props.onTouchEnd?.(e);
      }}
      style={{
        ...props.style,
        ...(isMobile && {
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
          cursor: "pointer",
        }),
      }}
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
};

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
