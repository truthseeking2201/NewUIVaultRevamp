import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const UserHoldingTooltip = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tooltip>
      <TooltipTrigger
        className="w-full text-left"
        type="button"
      >
        {children}
      </TooltipTrigger>
      <TooltipContent className="shadow-[0_2px_4px_rgba(255,255,255,0.25)]">
        <div className="text-white/80 font-sans text-xs py-1 max-w-[200px] text-center">
          This is your Current Liquidity and Cumulative Rewards in the vault
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default UserHoldingTooltip;
