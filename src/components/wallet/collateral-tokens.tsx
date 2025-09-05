import { useUserAssetsStore } from "@/hooks";
import { cn } from "@/lib/utils";
import BigNumber from "bignumber.js";
import { useMemo } from "react";

export const CollateralTokens = () => {
  const { assets } = useUserAssetsStore();
  const filteredAssets = useMemo(
    () => assets.filter((asset) => new BigNumber(asset.balance).gt(0)),
    [assets]
  );
  return (
    <div className="mb-4">
      <div className="font-sans font-medium text-sm mb-3 text-white">
        Assets
      </div>
      <div
        className={cn(
          "rounded-lg border border-white/15 bg-[rgba(255, 255, 255, 0.08)] max-h-[200px] overflow-y-auto px-3"
        )}
      >
        {filteredAssets.map((asset, index) => {
          return (
            <div
              key={asset.coin_type}
              className={cn(
                "flex justify-between items-center gap-3 py-3",
                index !== filteredAssets.length - 1 &&
                  "border-b border-white/15 pb-3"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <img
                  key={asset.display_name}
                  src={asset.image_url}
                  alt={asset.display_name}
                  className={cn("rounded-full w-[20px] h-[20px]")}
                />
                <div className="font-bold text-white text-sm">
                  {asset.display_name}
                </div>
              </div>
              <div>
                <div className="font-regular font-mono text-sm text-white">
                  {asset.balance}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
