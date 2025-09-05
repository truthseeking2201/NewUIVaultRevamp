import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { Loader } from "lucide-react";
import React from "react";

export interface Web3ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  loading?: boolean;
  hideContentOnLoading?: boolean;
}

const Web3Button = React.forwardRef<HTMLButtonElement, Web3ButtonProps>(
  (
    {
      className,
      asChild = false,
      loading = false,
      disabled,
      children,
      hideContentOnLoading = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(
          "py-2 px-5 rounded-md text-ai-dark font-semibold transition-all duration-300 relative flex items-center justify-center",
          isDisabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-80",
          className
        )}
        style={{
          background:
            "linear-gradient(90deg, #FFE8C9 0%, #F9F4E9 25%, #E3F6FF 60%, #C9D4FF 100%)",
        }}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            {!hideContentOnLoading && children}
          </div>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Web3Button.displayName = "Button";

export default Web3Button;
