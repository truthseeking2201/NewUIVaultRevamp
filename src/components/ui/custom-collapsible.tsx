import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomCollapsibleProps {
  title: string | React.ReactNode;
  description?: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const CustomCollapsible: React.FC<CustomCollapsibleProps> = ({
  title,
  description,
  children,
  isOpen = false,
  onToggle,
}) => {
  const [open, setOpen] = useState(isOpen);

  const handleToggle = () => {
    setOpen(!open);
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <div className="rounded-lg bg-black border border-white/15">
      <div
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer ",
          !open && "hover:bg-white/5 transition-colors"
        )}
        onClick={handleToggle}
      >
        <div className="text-white text-md font-semibold">{title}</div>
        <div className="flex items-center gap-2">
          {description && (
            <span className="text-sm text-gray-400">{description}</span>
          )}
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronUp className="h-5 w-5" />
          </motion.div>
        </div>
      </div>
      {open && <div className="border-t border-white/15 mx-4" />}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                opacity: { delay: 0.2, duration: 0.1 },
                height: { duration: 0.3 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                opacity: { duration: 0.1 },
                height: { duration: 0.3 },
              },
            }}
            className="p-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
