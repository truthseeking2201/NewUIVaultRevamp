import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Props = {
  className?: string;
  size?: number;
};

const IconCheckSuccess = ({ className, size }: Props) => {
  return (
    <div
      className={cn(
        "bg-emerald-500 rounded-full flex items-center justify-center h-16 w-16 flex-shrink-0",
        className
      )}
    >
      <Check size={size || 32} />
    </div>
  );
};

export { IconCheckSuccess };
