import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  classNameText?: string;
  classNameCheck?: string;
};

const IconReady = ({ className, classNameText, classNameCheck }: Props) => {
  return (
    <div
      className={cn(
        "flex items-center bg-green-ready/20 px-1 py-[2px] sm:py-[5px] rounded-full",
        className
      )}
    >
      <div className="md:w-4 md:h-4 w-3 h-3 bg-green-ready rounded-full flex items-center justify-center">
        <Check
          className={cn("text-black", classNameCheck)}
          strokeWidth="4"
          size={10}
        />
      </div>

      <span
        className={cn(
          "sm:text-xs text-[10px] sm:leading-[20px] leading-[17px] font-sans font-bold ml-1 text-green-ready",
          classNameText
        )}
      >
        READY
      </span>
    </div>
  );
};

export default IconReady;
