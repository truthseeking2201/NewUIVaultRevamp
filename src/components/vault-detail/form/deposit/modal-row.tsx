import { cn } from "@/lib/utils";
import React from "react";

const ModalRow = ({
  label,
  value,
  className,
}: {
  label: string | React.ReactNode;
  value: string | React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      {typeof label === "string" ? (
        <div className="text-base font-sans text-[#9CA3AF] max-md:text-sm">
          {label}
        </div>
      ) : (
        label
      )}
      {typeof value === "string" ? (
        <div className="text-lg font-mono max-md:text-sm text-white">
          {value}
        </div>
      ) : (
        value
      )}
    </div>
  );
};

export default ModalRow;
