import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import useBreakpoint from "@/hooks/use-breakpoint";

const FORM_TABS = [
  { value: "deposit", label: "Deposit" },
  { value: "withdraw", label: "Withdraw" },
];

export const FormTabs = ({
  tab,
  setTab,
}: {
  tab: string;
  setTab: (tab: string) => void;
}) => {
  const { isMd } = useBreakpoint();
  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value)}>
      <TabsList className="flex gap-1 relative z-10 w-full">
        {FORM_TABS.map((t) => {
          const isActive = tab === t.value;
          return (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="w-full py-2"
              style={
                isActive
                  ? {
                      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
                      background:
                        "linear-gradient(90deg, #FFE2C4 0%, #E8F3FF 100%)",
                    }
                  : {}
              }
            >
              <span
                className={cn("font-sans text-sm flex items-center", {
                  "text-13px": !isMd,
                  "text-ai-dark font-bold ": isActive,
                  "text-white/50 hover:text-white/65": !isActive,
                })}
              >
                {isActive ? (
                  t.value === "deposit" ? (
                    <Plus className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )
                ) : t.value === "deposit" ? (
                  <Plus className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                <span className="ml-1">{t.label}</span>
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};
