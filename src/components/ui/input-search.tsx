import * as React from "react";
import { ChangeEvent, useCallback, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const InputSearch = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    onChange: (value: string) => void;
    debounceTime?: number;
  }
>(({ className, type, onChange, debounceTime = 1000, ...props }, ref) => {
  const [value, setValue] = useState<string>("");

  const handleChangeValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
  }, []);

  const handleClear = useCallback(() => {
    setValue("");
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(value);
    }, debounceTime); // wait 1000ms after user stops typing

    return () => clearTimeout(handler); // clear timeout if value changes before 1000ms
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <Search className="h-4 w-4 absolute left-3 top-3 text-075" />
      <input
        value={value}
        type={type || "text"}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background pr-3 pl-9 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
        onChange={handleChangeValue}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
        {value && (
          <button
            onClick={handleClear}
            className="bg-black border-none flex items-center justify-center rounded-full w-4 h-4"
            type="button"
            aria-label="Clear input"
          >
            <X size={12} color="#989898" />
          </button>
        )}
      </div>
    </div>
  );
});
InputSearch.displayName = "InputSearch";

export { InputSearch };
