import React, { useMemo, useState } from "react";
import { VaultItemData } from "./vault-list";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { showFormatNumber } from "@/lib/number";
import { formatShortCurrency } from "@/utils/currency";

const campaigns_data = {
  "SUI-USDC-cetus": {
    usdc: 1500,
    xp: 100000000,
    startDate: "28/07/2025",
    endDate: "15/08/2025",
    snapshotDate: "14/08/2025, 3PM SGT",
  },
  "SUI-USDC-mmt": {
    usdc: 1500,
    xp: 100000000,
    startDate: "28/07/2025",
    endDate: "15/08/2025",
    snapshotDate: "14/08/2025, 3PM SGT",
  },
  "DEEP-SUI-mmt": {
    // usdc: 1250,
    xp: 100000000,
    startDate: "28/07/2025",
    endDate: "15/08/2025",
    snapshotDate: "14/08/2025, 3PM SGT",
  },
  "WAL-SUI-mmt": {
    // usdc: 1250,
    xp: 100000000,
    startDate: "28/07/2025",
    endDate: "15/08/2025",
    snapshotDate: "14/08/2025, 3PM SGT",
  },
};

const campaign_default = {
  xp: 100000000,
};

const tokens = [
  { value: "usdc", symbol: "USDC", image: "/coins/usdc.png" },
  { value: "xp", symbol: "XP Shares", image: "/coins/xp.png" },
];

const VaultRewards = ({ item }: { item: VaultItemData }) => {
  const campaignData = useMemo(() => {
    let campaignName = `${item.pool.pool_name}-${item.exchange_code}`;
    if (campaigns_data[campaignName]) {
      return campaigns_data[campaignName];
    }
    campaignName = `${item.vault_name}-${item.exchange_code}`;
    return campaigns_data[campaignName] || campaign_default;
  }, [item]);

  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip
        open={open}
        onOpenChange={setOpen}
      >
        <TooltipTrigger asChild>
          <div
            className="flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {tokens.map((token, index) => (
              <React.Fragment key={`image-${index}`}>
                {campaignData[token.value] && (
                  <img
                    src={token.image}
                    alt={token.symbol}
                    className="w-6 h-6 first:ml-0 md:ml-[-4px]"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent className="shadow-[0_2px_4px_rgba(255,255,255,0.25)] p-3 max-w-[300px]">
          <div>
            <div className="text-sm bg-clip-text text-transparent bg-[linear-gradient(90deg,_#FFE8C9_0%,_#F9F4E9_25%,_#E3F6FF_60%,_#C9D4FF_100%)] mb-3 font-medium">
              TOTAL REWARD POOL
            </div>
            <hr />

            {tokens.map((token, index) => (
              <React.Fragment key={`value-${index}`}>
                {campaignData[token.value] && (
                  <div className="flex items-center gap-2 min-w-[200px] mb-1 mt-2">
                    <img
                      src={token.image}
                      alt={token.symbol}
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-white font-mono font-normal">
                      {formatShortCurrency(campaignData[token.value], 2)}{" "}
                      {token.symbol}
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))}
            <div className="rounded-md bg-[#242424] p-2 mt-2 font-sans font-normal text-xs">
              All rewards will be distributed at the end of the campaign, based
              on your average deposit over the 14-day period and the duration
              your funds were kept in the vault. The larger your deposit and the
              longer it remains, the greater your share of the rewards per
              vault.
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VaultRewards;
