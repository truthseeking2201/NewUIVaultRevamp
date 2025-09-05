import { ChangeEvent, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface FormattedNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxDecimals?: number;
  onValidate?: (value: string) => void;
  onMaxAmount?: () => void;
  onBlur?: (value: string) => void;
}

export function FormattedNumberInput({
  value,
  onChange,
  placeholder = "0.00",
  className = "",
  onValidate,
  onMaxAmount,
  onBlur,
  ...props
}: FormattedNumberInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Only allow numbers and one decimal point
      if (!/^\d*\.?\d{0,2}$/.test(inputValue) && inputValue !== "") {
        return;
      }

      onChange(inputValue);
      onValidate?.(inputValue);
    },
    [onChange, onValidate]
  );

  const handleBlur = useCallback(() => {
    onBlur?.(value);
  }, [onBlur, value]);

  const handleClear = useCallback(() => {
    onChange("");
    onValidate?.("");
  }, [onChange, onValidate]);

  return (
    <div className="relative mb-2 mt-2">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn("input-vault w-full font-heading-lg pr-24", className)}
        {...props}
      />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
        {value && (
          <button
            onClick={handleClear}
            className="bg-black border flex items-center justify-center rounded-full w-7 h-7"
            type="button"
            aria-label="Clear input"
          >
            <X
              size={16}
              color="#989898"
            />
          </button>
        )}
        <div className="flex rounded-full mx-auto bg-gradient-to-tr from-[#0090FF] via-[#FF6D9C] to-[#FB7E16] p-px hover:opacity-70 transition-all duration-300">
          <button
            onClick={onMaxAmount}
            type="button"
            className="bg-[#202124] border border-[#1A1A1A] text-white hover:text-white px-4 py-1 rounded-[16px] text-sm font-medium"
          >
            MAX
          </button>
        </div>
      </div>
    </div>
  );
}
