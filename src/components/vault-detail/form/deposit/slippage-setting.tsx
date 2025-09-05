import ConditionRenderer from "@/components/shared/condition-renderer";
import { Input } from "@/components/ui/input";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";

type SlippageSettingProps = {
  value: string;
  onChange: (value: string) => void;
};

const WarningIcon = () => {
  return (
    <div className="max-md:ml-[4px]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="13"
        height="12"
        viewBox="0 0 13 12"
        fill="none"
      >
        <path
          d="M0.688907 11.25C0.581963 11.25 0.484741 11.2233 0.397241 11.1698C0.309741 11.1163 0.241685 11.0458 0.193074 10.9583C0.144463 10.8708 0.117727 10.776 0.112866 10.674C0.108004 10.5719 0.134741 10.4722 0.193074 10.375L5.58891 1.04167C5.64724 0.944444 5.72259 0.871528 5.81495 0.822917C5.90731 0.774306 6.0021 0.75 6.09932 0.75C6.19655 0.75 6.29134 0.774306 6.3837 0.822917C6.47606 0.871528 6.55141 0.944444 6.60974 1.04167L12.0056 10.375C12.0639 10.4722 12.0906 10.5719 12.0858 10.674C12.0809 10.776 12.0542 10.8708 12.0056 10.9583C11.957 11.0458 11.8889 11.1163 11.8014 11.1698C11.7139 11.2233 11.6167 11.25 11.5097 11.25H0.688907ZM6.09932 9.5C6.2646 9.5 6.40314 9.4441 6.51495 9.33229C6.62675 9.22049 6.68266 9.08194 6.68266 8.91667C6.68266 8.75139 6.62675 8.61285 6.51495 8.50104C6.40314 8.38924 6.2646 8.33333 6.09932 8.33333C5.93405 8.33333 5.7955 8.38924 5.6837 8.50104C5.57189 8.61285 5.51599 8.75139 5.51599 8.91667C5.51599 9.08194 5.57189 9.22049 5.6837 9.33229C5.7955 9.4441 5.93405 9.5 6.09932 9.5ZM6.09932 7.75C6.2646 7.75 6.40314 7.6941 6.51495 7.58229C6.62675 7.47049 6.68266 7.33194 6.68266 7.16667V5.41667C6.68266 5.25139 6.62675 5.11285 6.51495 5.00104C6.40314 4.88924 6.2646 4.83333 6.09932 4.83333C5.93405 4.83333 5.7955 4.88924 5.6837 5.00104C5.57189 5.11285 5.51599 5.25139 5.51599 5.41667V7.16667C5.51599 7.33194 5.57189 7.47049 5.6837 7.58229C5.7955 7.6941 5.93405 7.75 6.09932 7.75Z"
          fill="#FF9903"
        />
      </svg>
    </div>
  );
};

const SLIPPAGE_OPTIONS = [
  {
    value: "0.05",
    label: "0.05%",
  },
  {
    value: "0.1",
    label: "0.1%",
  },
  {
    value: "0.5",
    label: "0.5%",
  },
  {
    value: "1",
    label: "1%",
  },
  {
    value: "custom",
    label: "Custom",
  },
];

const SUGGESTION_SLIPPAGE = 0.5;
const WARNING_SLIPPAGE = 5;

const SlippageSetting = ({ value, onChange }: SlippageSettingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isWarning = Number(value) > WARNING_SLIPPAGE;
  const [isCustomSlippage, setIsCustomSlippage] = useState(false);
  const [customSlippage, setCustomSlippage] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleExpanded = () => {
    if (isCustomSlippage) {
      onChange(`${customSlippage}`);
    }
    setIsCustomSlippage(false);
    setIsOpen(!isOpen);
  };

  const handleChange = (value: string) => {
    if (value === "custom") {
      setIsCustomSlippage(true);
      onChange(`${customSlippage}`);
      return;
    }
    setIsCustomSlippage(false);
    onChange(value);
  };

  useEffect(() => {
    if (isCustomSlippage) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      onChange(`${customSlippage}`);
    }
  }, [isCustomSlippage, onChange, customSlippage]);

  const tabValue = useMemo(() => {
    return (
      SLIPPAGE_OPTIONS.find((tab) => value && tab.value === value)?.value ||
      "custom"
    );
  }, [value]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <LabelWithTooltip
          label="Max Slippage"
          labelClassName="text-white/80 text-sm"
          tooltipContent="In NODO AI Vaults, Max Slippage is the highest price deviation allowed during swaps to protect you from receiving fewer tokens than expected. Lower slippage means safer but slower execution, higher slippage means faster but riskier"
        />
        <div
          className="flex items-center gap-1 cursor-pointer"
          id="toggle-slippage"
          onClick={toggleExpanded}
        >
          {value} %
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="9"
            height="6"
            viewBox="0 0 9 6"
            fill="none"
            className={`transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <path
              d="M1.78098 0.769043C1.06826 0.769043 0.711323 1.63076 1.21529 2.13473L4.28392 5.20336C4.59634 5.51578 5.10288 5.51578 5.41529 5.20336L8.48392 2.13473C8.9879 1.63076 8.63096 0.769043 7.91824 0.769043H1.78098Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
      <div
        id="expanded-slippage"
        ref={ref}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-30 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        <div
          className="p-2 rounded-lg w-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(255, 232, 201, 0.15) 0%, rgba(249, 244, 233, 0.15) 25%, rgba(227, 246, 255, 0.15) 60%, rgba(201, 212, 255, 0.15) 100%)",
          }}
        >
          <Tabs value={tabValue} onValueChange={handleChange}>
            <TabsList className="p-1 flex gap-1 w-full">
              {SLIPPAGE_OPTIONS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  className={cn(
                    "w-full border border-transparent max-md:px-0.5 data-[state=active]:border-[#FFE8C9]"
                  )}
                  value={tab.value}
                >
                  {isCustomSlippage && tab.value === "custom" ? (
                    <div className="rounded-[6px] flex items-center gap-1 max-md:gap-0">
                      {isWarning && <WarningIcon />}
                      <Input
                        className="px-1 h-[20px] w-[20px] p-0 max-md:text-xs max-md:h-[14px] border-none no-outline focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-center"
                        value={`${customSlippage}`}
                        ref={inputRef}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const regex = new RegExp(`^\\d*\\.?\\d{0,2}$`);
                          // Only allow numbers and one decimal point
                          if (!regex.test(inputValue) && inputValue !== "") {
                            return;
                          }

                          if (Number(e.target.value || "") > 100) {
                            return;
                          }

                          setCustomSlippage(
                            `${e.target.value}`.replace("%", "")
                          );
                        }}
                        placeholder=""
                      />
                      <span className="text-xs max-md:mr-[6px]">%</span>
                    </div>
                  ) : (
                    <div
                      className="w-full"
                      onClick={() => {
                        if (tabValue === "custom") {
                          setIsCustomSlippage(true);
                        }
                      }}
                    >
                      {tab.value === "custom" && customSlippage
                        ? `${customSlippage}%`
                        : tab.label}
                    </div>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {/* {isDuplicateValue && (
              <div className="text-xs text-red-500 mt-2">
                {isDuplicateValue.label} is already exists. Please input another
                value.
              </div>
            )} */}
          </Tabs>
          <ConditionRenderer
            when={value?.toString() !== SUGGESTION_SLIPPAGE.toString()}
          >
            <div
              className={cn(
                "mt-2 text-xs cursor-pointer w-fit font-medium",
                isWarning ? "text-[#FF9903]" : "text-[#64EBBC]",
                value === "custom" && "text-red-500"
              )}
              onClick={() => {
                setIsCustomSlippage(false);
                onChange(`${SUGGESTION_SLIPPAGE}`);
              }}
            >
              Suggestion {SUGGESTION_SLIPPAGE}%
            </div>
          </ConditionRenderer>
          {isWarning && (
            <div className="rounded-lg bg-[#FF990333] px-4 py-2 text-xs font-medium text-[#FF9903] mt-1.5">
              Slippage is high, consider lowering to reduce front-run
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlippageSetting;
