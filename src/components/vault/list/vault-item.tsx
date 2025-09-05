import { useBreakpoint } from "@/hooks/use-breakpoint";
import { cn, formatVaultNameDisplay } from "@/lib/utils";
import { VaultItemData } from "./vault-list";

export const VaultItem = ({ item }: { item: VaultItemData }) => {
  const { windowWidth } = useBreakpoint();
  const isLargeScreen = windowWidth >= 1440;

  return (
    <div className="flex items-center gap-4 min-w-[180px] max-w-[240px] 2xl:max-w-none">
      <div className="flex items-center justify-center">
        {item.token_pools?.length > 0 &&
          item.token_pools.map((token) => (
            <img
              key={token.name}
              src={token.image}
              alt={token.name}
              className={cn(
                "rounded-full flex-shrink-0",
                isLargeScreen ? "w-[32px] h-[32px]" : "w-[24px] h-[24px]"
              )}
            />
          ))}
      </div>
      <div>
        <div className="font-semibold text-white text-base leading-tight mb-1">
          {formatVaultNameDisplay(item.vault_name)}
        </div>
        <div className="flex gap-1 items-center text-base">
          <img
            src={item.exchange_image}
            alt={item.exchange_name}
            className="h-[12px]"
          />
          <div className={cn("font-sans font-semibold text-xs")}>
            {item.exchange_name}
          </div>
        </div>
      </div>
    </div>
  );
};
