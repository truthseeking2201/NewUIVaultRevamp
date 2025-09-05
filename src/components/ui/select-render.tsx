import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { OptionsSelectType } from "@/types/options-select.types.ts";

interface SelectRenderProps {
  value: string;
  options: OptionsSelectType[];
  className?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function SelectRender({
  value = "",
  options = [],
  className = "",
  disabled = false,
  onChange = () => {},
}: SelectRenderProps) {
  /**
   * RENDER
   */
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("focus:ring-1", className)}>
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {options.map((option, idx) => (
          <SelectItem
            key={`select-item-${idx}`}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
