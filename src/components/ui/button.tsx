import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:w-5 [&_svg]:h-5",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-brand text-white shadow-brand hover:shadow-brand-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-white/10 bg-transparent hover:bg-white/5 hover:border-white/20 font-semibold",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "border border-brand-500 text-brand-500 hover:bg-brand-50/10",
        link: "text-brand-500 underline-offset-4 hover:underline",
        icon: "bg-transparent border-0 hover:opacity-80",
        primary: "bg-ai text-[#0A080E] font-semibold hover:bg-ai/85",
        "pagination-default":
          "bg-black text-white/70 font-semibold hover:bg-black/70 hover:border-white/40 hover:text-white",
        "pagination-active":
          "bg-black text-white font-semibold border-2 border-transparent bg-clip-padding outline-offset-2",
        "link-orange":
          "bg-gradient-to-r from-[#F2BB89] via-[#F3D2B5] to-[#F5C8A4] bg-clip-text text-transparent hover:opacity-80",
        "ai-outline":
          "border border-ai bg-transparent text-ai hover:bg-ai/5 hover:border-ai/50 font-semibold",
        web3: "bg-gradient-to-r from-[#FFE8C9] via-[#F9F4E9] via-[#E3F6FF] to-[#C9D4FF] text-black font-semibold hover:opacity-80 rounded-lg",
      },
      size: {
        default: "h-11 px-4 py-2",
        xs: "h-8 rounded-md px-3 text-xs",
        sm: "h-9 rounded-lg px-3 text-xs",
        md: "h-10 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-xl px-8 text-[16px]",
        xl: "h-14 rounded-xl px-16 text-lg",
        icon: "h-10 w-10 rounded-lg",
        pagination: "h-[32px] w-[32px] rounded-lg border border-white/10",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
