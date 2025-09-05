import React from "react";
import { X } from "lucide-react";
import { useRibbon, setRibbonDismissed } from "@/hooks";
import { cn } from "@/lib/utils";

export const Ribbon: React.FC<{
  message: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ message, onClick, className }) => {
  const [visibleRibbon, setVisibleRibbon] = useRibbon();

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setRibbonDismissed();
    setVisibleRibbon(false);
  };

  if (!visibleRibbon) return null;

  return (
    <div
      className={cn(
        "bg-[linear-gradient(90deg,_rgba(255,0,166,0.40)_0%,_rgba(255,0,200,0.40)_12%,_rgba(255,0,255,0.40)_25%,_rgba(196,0,255,0.40)_38%,_rgba(74,40,255,0.40)_50%,_rgba(0,47,255,0.40)_62%,_rgba(0,120,255,0.40)_75%,_rgba(0,196,255,0.40)_88%,_rgba(0,255,255,0.40)_100%)] text-white py-2 text-center font-medium text-lg relative w-full z-50",
        onClick ? "cursor-pointer" : "cursor-default",
        className
      )}
      onClick={onClick}
    >
      <span className="md:text-lg text-sm">{message}</span>
      <button
        onClick={handleClose}
        className="absolute md:right-4 right-1 md:top-2 top-1.5 bg-transparent border-none text-white text-xl cursor-pointer"
        aria-label="Close ribbon"
        type="button"
      >
        <X />
      </button>
    </div>
  );
};
