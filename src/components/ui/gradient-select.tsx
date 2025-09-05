import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Button } from "./button";

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  left?: React.ReactNode;
}

interface GradientSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  buttonClassName?: string;
}

export const GradientSelect: React.FC<GradientSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  buttonClassName,
}) => {
  const [open, setOpen] = useState(false);

  const selectedNames = useMemo(() => {
    if (value.includes("all")) return placeholder;
    if (value.length === 1)
      return options.find((o) => o.value === value[0])?.label || "";
    return value
      .map((id) => options.find((o) => o.value === id)?.label)
      .filter(Boolean)
      .join(", ");
  }, [value, options, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="md"
          className={cn(
            "max-md:w-full md:min-w-40 flex items-center justify-between md:bg-[#181818] md:hover:bg-[#292929] text-white rounded-lg border border-white/20 bg-[#000]",
            buttonClassName
          )}
        >
          <span className="truncate text-left font-medium">
            {selectedNames}
          </span>
          <svg
            className="w-4 h-4 ml-2 opacity-60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto md:min-w-[240px] bg-[#181818] border border-white/20 rounded-xl shadow-lg p-2"
        align="start"
        sideOffset={8}
      >
        {options.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <div
              key={opt.value}
              className={cn(
                "flex items-center px-1 py-1 cursor-pointer rounded-lg hover:bg-[#232323]",
                opt.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                if (opt.disabled) return;
                let newValue: string[];
                if (opt.value === "all") {
                  newValue = ["all"];
                } else if (value.includes("all")) {
                  newValue = [opt.value];
                } else if (value.includes(opt.value)) {
                  newValue = value.filter((v) => v !== opt.value);
                  if (newValue.length === 0) newValue = ["all"];
                } else {
                  newValue = [...value, opt.value];
                }
                onChange(newValue);
              }}
            >
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex flex-row items-center">
                  <div
                    className={cn(
                      "w-[24px] h-[24px] flex items-center justify-center rounded-[6px]",
                      checked
                        ? "bg-gradient-to-r from-[#FFE8C9] to-[#F9F4E9] via-[#E3F6FF] via-[#C9D4FF]"
                        : "border border-white/30"
                    )}
                  >
                    {checked ? (
                      <Check className="w-3 h-3 text-black" strokeWidth={4} />
                    ) : (
                      <div className="w-3 h-3" />
                    )}
                  </div>
                  {opt.icon && (
                    <div className="flex items-center justify-center ml-2">
                      {opt.icon}
                    </div>
                  )}
                  {typeof opt.label === "string" ? (
                    <span className="text-white ml-2">{opt.label}</span>
                  ) : (
                    opt.label
                  )}
                </div>
                {opt.left && opt.left}
              </div>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};
