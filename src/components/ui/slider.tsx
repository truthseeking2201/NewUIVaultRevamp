
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[2px] w-full grow overflow-hidden rounded-full bg-[#28304B]">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[#FF8800] to-[#FFA822]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className="block h-3.5 w-3.5 rounded-full border border-white/30 bg-[#FF8800] ring-offset-background transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      style={{ 
        transition: "transform 80ms cubic-bezier(.22,1,.36,1)",
        boxShadow: "0 2px 4px -1px rgba(0,0,0,0.4)"
      }}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
