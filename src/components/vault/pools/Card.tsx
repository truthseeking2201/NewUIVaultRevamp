import ConditionRenderer from "@/components/shared/condition-renderer";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useCollateralLPRate } from "@/hooks/use-deposit-vault";
import { useGetCoinBalance } from "@/hooks/use-my-assets";
import { useDepositVaultStore } from "@/hooks/use-store";
import { useWallet } from "@/hooks/use-wallet";
import { cn, formatAmount, formatPercentage, formatVaultNameDisplay } from "@/lib/utils";
import { VaultPool } from ".";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useGetVaultConfig } from "@/hooks";

const APR = ({
  text,
  isLargeScreen,
}: {
  text: string;
  isLargeScreen: boolean;
}) => {
  return (
    <div
      className={cn(
        "font-sans font-bold bg-gradient-to-r from-[#9DEBFF] to-[#00FF5E] bg-clip-text text-transparent",
        isLargeScreen ? "text-[22px]" : "text-[16px]"
      )}
    >
      {text}
    </div>
  );
};

const VaultCard = ({
  pool,
  className,
}: {
  pool: VaultPool;
  className?: string;
}) => {
  const { windowWidth } = useBreakpoint();
  const isLargeScreen = windowWidth >= 1440;
  const exchange = EXCHANGE_CODES_MAP[pool.exchange_id];

  const { balance: ndlpAmount } = useGetCoinBalance(
    pool.vault_lp_token,
    pool.vault_lp_token_decimals
  );

  const { vaultConfig } = useGetVaultConfig(pool.vault_id);
  const conversionRate = useCollateralLPRate(true, vaultConfig);
  const userHolding = ndlpAmount * conversionRate;
  const isSelected = pool.isSelected && pool.isLive;
  const { setDepositVault } = useDepositVaultStore();
  const { isAuthenticated } = useWallet();

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow p-[2px] cursor-pointer group transition-transform duration-300",
        !pool.isLive && "opacity-50",
        !isSelected && "p-[1px] hover:scale-[1.04]",
        isSelected && "p-[4px] ",
        className
      )}
      style={{
        background: isSelected
          ? "linear-gradient(90deg, #FFF -3.93%, #0090FF 22.06%, #FF6D9C 48.04%, #FB7E16 74.02%, #FFF 100%)"
          : "#5C5C5C",
      }}
      onMouseEnter={(e) => {
        if (pool.isLive) {
          e.currentTarget.style.background =
            "linear-gradient(90deg, #FFF -3.93%, #0090FF 22.06%, #FF6D9C 48.04%, #FB7E16 74.02%, #FFF 100%)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "#5C5C5C";
        }
      }}
      onClick={() => {
        if (pool.isLive) {
          setDepositVault(pool.vault_id);
        }
      }}
    >
      <div
        className={cn("flex flex-col rounded-xl h-full p-4")}
        style={{
          background: "linear-gradient(135deg, #212121 22.8%, #060606 90.81%)",
        }}
      >
        <div className="flex items-start justify-center mb-5 gap-2">
          <div className="flex items-center justify-center">
            <span
              className={cn(
                "text-white font-bold",
                isLargeScreen ? "text-md" : "text-sm",
                "truncate max-w-[120px]"
              )}
            >
              {formatVaultNameDisplay(pool.vault_name)}
            </span>
          </div>
          <div
            className={cn(
              "font-medium text-xs bg-[#44EF8B] rounded-xl",
              pool.isLive ? "bg-[#44EF8B]" : "bg-[#FFFFFF33]",
              pool.isLive ? "text-black" : "text-white",
              isLargeScreen
                ? "text-[12px] px-2 pt-1 pb-0.5"
                : "text-[10px] px-1.5 py-0.5"
            )}
          >
            {pool.isLive ? "Live" : "Coming Soon"}
          </div>
        </div>
        <div className="flex items-center justify-center">
          {pool?.tokens?.length > 0 &&
            pool.tokens.map((token, index) => (
              <img
                key={token}
                src={`/coins/${token?.toLowerCase()}.png`}
                alt={token}
                className={cn(
                  "mr-2 rounded-full",
                  isLargeScreen ? "w-[36px] h-[36px]" : "w-[24px] h-[24px]",
                  index > 0 && "ml-[-15px]"
                )}
              />
            ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span
            className={cn(
              " text-white/50",
              isLargeScreen ? "text-base" : "text-xs"
            )}
          >
            APR:
          </span>
          <APR
            isLargeScreen={isLargeScreen}
            text={
              pool.APR && pool.APR !== 0
                ? `${formatPercentage(pool.APR < 0 ? 0 : pool.APR)}`
                : "--"
            }
          />
        </div>
        <ConditionRenderer
          when={pool.show_dex}
          fallback={
            <ConditionRenderer when={isAuthenticated}>
              <div className="min-h-[26px]" />
            </ConditionRenderer>
          }
        >
          <div className="flex items-center justify-between mt-2">
            <div
              className={cn(
                "text-white/50",
                isLargeScreen ? "text-base" : "text-xs"
              )}
            >
              DEX
            </div>
            <div className="flex gap-1 items-center text-base">
              <img
                src={`/dexs/${exchange?.code}.png`}
                className={cn(isLargeScreen ? "h-[16px]" : "h-[12px]")}
              />
              <div
                className={cn(
                  "font-sans font-bold",
                  isLargeScreen ? "text-base" : "text-xs"
                )}
              >
                {exchange.name}
              </div>
            </div>
          </div>
        </ConditionRenderer>
        <div
          className={cn(
            "mt-4 bg-[#FFFFFF26] py-[6px] px-2 rounded-[6px] w-full  flex items-center justify-between",
            isLargeScreen ? "text-sm" : "text-xs"
          )}
        >
          <span className={"text-white/50"}>Your holding: </span>
          <span className="text-white font-bold">
            {userHolding && userHolding !== 0
              ? `${formatAmount({ amount: userHolding })}` // Assuming 9 decimals, adjust as needed
              : "--"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VaultCard;
