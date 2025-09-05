import {
  useCurrentDepositVault,
  useGetDepositVaults,
  useWhitelistWallet,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import VaultCard from "./Card";

export type VaultPool = {
  vault_id: string;
  tokens: string[];
  APR: number;
  isLive: boolean;
  vault_lp_token: string;
  vault_lp_token_decimals: number;
  isSelected: boolean;
  exchange_id: number;
  vault_name: string;
  show_dex?: boolean;
};

const VaultPools = () => {
  const { data: depositVaults } = useGetDepositVaults();
  const currentVault = useCurrentDepositVault();
  const { isWhitelisted, isLoading } = useWhitelistWallet();

  const pools = useMemo(() => {
    return depositVaults.map((vault) => ({
      vault_id: vault.vault_id,
      tokens: ((vault?.pool?.pool_name || "").replace(/\//g, "-")
        .split("-")
        .filter(Boolean)),
      APR: vault.apr,
      isLive: vault.is_active,
      vault_lp_token: vault.vault_lp_token,
      vault_lp_token_decimals: vault.vault_lp_token_decimals,
      isSelected: vault.vault_id === currentVault.vault_id,
      exchange_id: vault?.metadata?.exchange_id ?? vault.exchange_id,
      vault_name: vault.vault_name,
      show_dex: !isLoading && !!isWhitelisted,
    }));
  }, [depositVaults, currentVault, isWhitelisted, isLoading]);

  return (
    <div>
      <div className="font-md font-semibold">Select a Vault</div>
      <div
        className={cn(
          "gap-4 mt-[10px] auto-rows-fr",
          pools.length === 2 && "grid grid-cols-2",
          // 3 items: 3 columns
          pools.length === 3 && "grid grid-cols-3",
          // 4 items: 2 columns
          pools.length === 4 && "grid grid-cols-2",
          // 5 items: 6 columns (first row will have 3 items spanning 2 cols each, second row will have 2 items spanning 3 cols each)
          pools.length === 5 && "grid grid-cols-6",
          // 6 items: 3 columns
          pools.length === 6 && "grid grid-cols-3",
          // Default: 3 columns for any other number
          (pools.length < 3 || pools.length > 6) && "grid grid-cols-3"
        )}
      >
        {pools.map((pool, index) => (
          <VaultCard
            pool={pool}
            key={index}
            className={cn(
              // For 5 items: all items span 2 columns each for consistent width
              pools.length === 5 && "col-span-2"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default VaultPools;
