import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HelpCircle, InfoIcon } from "lucide-react";
import React, { ReactNode } from "react";
import ConditionRenderer from "../shared/condition-renderer";

interface LabelWithTooltipProps {
  tooltipContent?: ReactNode;
  tooltipClassName?: string;
  label: string;
  labelClassName?: string;
  iconClassName?: string;
  contentClassName?: string;
  labelContainerClassName?: string;
  icon?: ReactNode;
  type?: "info" | "help";
  asChild?: boolean;
  hasIcon?: boolean;
  propsTooltipContent?: any;
}

const iconMap = {
  info: <InfoIcon />,
  help: <HelpCircle />,
};

export const LabelWithTooltip = ({
  label,
  tooltipContent,
  labelClassName = "text-white/80 text-xs",
  tooltipClassName = "text-white/80 text-xs",
  contentClassName = "max-w-[250px]",
  labelContainerClassName,
  iconClassName,
  icon,
  type = "info",
  asChild = false,
  hasIcon = true,
  propsTooltipContent = {},
}: LabelWithTooltipProps) => {
  const computedIcon = iconMap[type] || <InfoIcon />;
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <div className={tooltipClassName}>
          <div
            className={cn("flex gap-1 items-center", labelContainerClassName)}
          >
            {hasIcon ? (
              <>
                <div className={labelClassName}>{label}</div>
                <ConditionRenderer when={!!tooltipContent}>
                  <TooltipTrigger
                    asChild={asChild}
                    type="button"
                  >
                    <span>
                      {computedIcon &&
                        React.cloneElement(computedIcon, {
                          className: cn(
                            "h-3.5 w-3.5 text-gray-400 mt-1",
                            iconClassName
                          ),
                        })}
                      {icon}
                    </span>
                  </TooltipTrigger>
                </ConditionRenderer>
              </>
            ) : (
              <TooltipTrigger asChild={asChild}>
                <div className={labelClassName}>{label}</div>
              </TooltipTrigger>
            )}
          </div>
          <ConditionRenderer when={!!tooltipContent}>
            <TooltipContent
              className={contentClassName}
              {...propsTooltipContent}
            >
              {typeof tooltipContent === "string" ? (
                <div className="text-white/80 text-xs">{tooltipContent}</div>
              ) : (
                tooltipContent
              )}
            </TooltipContent>
          </ConditionRenderer>
        </div>
      </Tooltip>
    </TooltipProvider>
  );
};
