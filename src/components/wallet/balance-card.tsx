import {
  useCurrentDepositVault,
  useGetVaultConfig,
  useGetVaultTokenPair,
} from "@/hooks";

import arrowDown from "@/assets/icons/arrow-down.svg";
import { useCollateralLPRate } from "@/hooks/use-deposit-vault";
import { formatAmount } from "@/lib/utils";

interface BalanceCardProps {
  className?: string;
}

export function BalanceCard({ className = "" }: BalanceCardProps) {
  const currentVault = useCurrentDepositVault();
  const { collateralToken, lpToken } = useGetVaultTokenPair();

  const { vaultConfig } = useGetVaultConfig(currentVault.vault_id);
  const conversionRate = useCollateralLPRate(true, vaultConfig);

  const ndlpAmount = lpToken?.balance || 0;
  const collateralTokenEquivalent = ndlpAmount * conversionRate;

  return (
    <div
      className={`bg-black backdrop-blur-sm rounded-2xl p-6 font-sans ${className}`}
    >
      <h2 className="text-white text-lg font-bold mb-6">Balance</h2>
      <div className="flex items-center gap-4">
        <img src="/coins/ndlp.png" alt="NDLP" className="w-10" />
        <div>
          <div className="text-white/70 text-sm">You have</div>
          <div className="text-white text-xl font-bold">
            {formatAmount({ amount: ndlpAmount })} NDLP
          </div>
          <div className="text-white/70 text-xs">
            1 NDLP = {conversionRate} {collateralToken?.display_name}
          </div>
        </div>
      </div>

      <div className="ml-1 py-4">
        <img src={arrowDown} alt="Arrow Down" className="w-8 h-8" />
      </div>

      <div className="flex items-center gap-4">
        <img
          src={collateralToken?.image_url}
          alt={collateralToken?.display_name}
          className="w-10"
        />
        <div>
          <div className="text-white/70 text-sm">You will get</div>
          <div className="text-white text-xl font-bold">
            {formatAmount({ amount: collateralTokenEquivalent })}{" "}
            {collateralToken?.display_name}
          </div>
        </div>
      </div>
    </div>
  );
}
