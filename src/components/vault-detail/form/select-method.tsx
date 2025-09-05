import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  METHOD_DEPOSIT_TABS,
  METHOD_DEPOSIT,
} from "@/components/vault-detail/constant";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  value: string;
  onChange: (value) => void;
  isEnableDual?: boolean;
};

const SelectMethod = ({
  value,
  className,
  onChange,
  isEnableDual = true,
}: Props) => {
  const tabs = useMemo(() => {
    if (isEnableDual) return METHOD_DEPOSIT_TABS;
    return METHOD_DEPOSIT_TABS.filter((i) => i.value !== METHOD_DEPOSIT.DUAL);
  }, [isEnableDual]);

  return (
    <Tabs
      value={value}
      onValueChange={onChange}
      className={cn("mb-4", className)}
    >
      <TabsList className="p-1 flex gap-1 ">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
          >
            {tab.label}
            {tab.value == METHOD_DEPOSIT.DUAL && (
              // <span className="glow-animation ml-2 text-10px md:text-xs font-bold px-2 py-0.5 font-sans rounded-[6px] bg-black [box-shadow:-2px_0_4px_0_rgba(255,255,255,0.75)_inset,2px_0_4px_0_rgba(0,255,251,0.95)_inset,0_-3px_4px_0_#07F_inset,0_3px_4px_0_#B708F6_inset]">
              <span className="glow-animation ml-2 text-10px md:text-xs font-bold px-2 py-0.5 font-sans rounded-[6px] bg-black new-glow">
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #FFE8C9 0%, #F9F4E9 25%, #DDF7F1 60%, #B5F0FF 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  NEW
                </span>
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default SelectMethod;
