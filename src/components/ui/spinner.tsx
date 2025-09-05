import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Loader } from "lucide-react";

type Props = {
  children?: ReactNode;
  className?: string;
  sizeIcon?: string;
  loading?: boolean;
};

const Spinner = ({ children, className, sizeIcon, loading }: Props) => {
  const _class = loading
    ? cn(
        "clear-both overflow-hidden opacity-50 pointer-events-none select-none",
        className
      )
    : "";
  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center	">
          <Loader
            size={sizeIcon || 40}
            className="animate-spin"
          />
        </div>
      )}
      <div className={_class}>{children}</div>
    </div>
  );
};

export { Spinner };
