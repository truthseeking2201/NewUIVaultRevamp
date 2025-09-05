import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

const Loader = ({ className, size }: { className?: string; size?: number }) => {
  return (
    <LoaderCircle
      className={cn("animate-spin", className)}
      size={size || 20}
    />
  );
};
export { Loader };
