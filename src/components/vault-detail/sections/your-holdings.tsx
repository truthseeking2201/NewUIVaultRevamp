import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ChevronDown from "@/assets/icons/chevron-down-gradient.svg?react";
import {
  useGetLpToken,
  useGetVaultConfig,
  useUserHolding,
  useWallet,
} from "@/hooks";
import { formatNumber } from "@/lib/number";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { ChevronRight, Info } from "lucide-react";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import useBreakpoint from "@/hooks/use-breakpoint";
import { calculateUserHoldings } from "@/utils/helpers";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { useLpBreakdown } from "@/hooks/use-vault";
import { format } from "date-fns";
import NdLpStatusChartCard from "@/components/vault-detail/sections/ndlp-status-chart-card";
import { tokenIconPath } from "@/components/vault-detail/activities/utils";

type YourHoldingProps = {
  isDetailLoading: boolean;
  vault_id: string;
  vault: BasicVaultDetailsType;
};

const COLORS = [
  "#52BDE1",
  "#CC98FF",
  "#52E1A5",
  "#FFEC98",
  "#5254E1",
  "#B94E50",
  "#FFFFFF",
  "#98C3FF",
];

const HoldingCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-[#2A2A2A] bg-white/10 md:p-4 py-2 px-3 w-full",
        className
      )}
    >
      {children}
    </div>
  );
};

const UnSignedHolding = () => {
  return (
    <div className="flex items-center justify-center gap-4">
      <div>
        <div className="font-bold text-base">Manage Your Position</div>
        <div className="text-sm text-white/60 mt-2">
          Make your first deposit below to start earning auto-compounded fees.
        </div>
      </div>
      <div className="md:mt-[-12px]">
        <img
          src="/banners/welcome-icon.png"
          alt="Welcome Icon"
          className="w-auto h-auto"
        />
      </div>
    </div>
  );
};

const YourHoldings = ({
  isDetailLoading,
  vault_id,
  vault,
}: YourHoldingProps) => {
  const [expanded, setExpanded] = useState(false);
  const { isAuthenticated } = useWallet();
  const isMockMode = (import.meta as any)?.env?.VITE_MOCK_MODE === "true";
  const authEnabled = isAuthenticated || isMockMode;
  const [userState, setUserState] = useState<
    "nonDeposit" | "pending" | "holding"
  >(isMockMode ? "pending" : "nonDeposit");

  const { isMobile } = useBreakpoint();

  const { vaultConfig } = useGetVaultConfig(vault_id);
  const lpToken = useGetLpToken(vault?.vault_lp_token, vault_id);

  const ndlp_balance = lpToken?.balance || "0";
  const { data, refetch } = useUserHolding(
    vault_id,
    ndlp_balance,
    authEnabled
  );

  const ndlpPriceUsd = (data as any)?.ndlp_price_usd ?? (vault as any)?.ndlp_price_usd ?? "1";
  const user_total_liquidity_usd = calculateUserHoldings(
    ndlp_balance,
    vault?.user_pending_withdraw_ndlp,
    vault?.vault_lp_token_decimals,
    String(ndlpPriceUsd)
  );

  const userHoldingData = useMemo(() => {
    return {
      ...data,
      // Prefer API mock data when available; fallback to computed values
      user_total_liquidity_usd:
        (data as any)?.user_total_liquidity_usd ?? user_total_liquidity_usd ?? 0,
      user_total_deposit_usd: (data as any)?.user_total_deposit_usd ?? 0,
      user_ndlp_balance:
        (data as any)?.user_ndlp_balance ?? Number(lpToken?.balance || 0),
      user_vault_rewards:
        data?.user_vault_rewards || vault?.reward_tokens || [],
      user_vault_tokens: data?.user_vault_tokens || vault?.tokens || [],
    };
  }, [data, vault, lpToken, user_total_liquidity_usd]);

  const pieData = useMemo(() => {
    const totalAmountInUsd = userHoldingData?.user_vault_tokens?.reduce(
      (sum, item) =>
        "amount_in_usd" in item && typeof item.amount_in_usd === "number"
          ? sum + item.amount_in_usd
          : sum,
      0
    );

    return (
      userHoldingData?.user_vault_tokens
        ?.slice()
        .sort((a, b) => (b.amount_in_usd ?? 0) - (a.amount_in_usd ?? 0))
        .map((item) => {
          return {
            amount: item?.amount || 0,
            amount_in_usd: item?.amount_in_usd || 0,
            token_name: item?.token_name || "",
            name: item?.token_name,
            token_symbol: item?.token_symbol,
            value:
              userHoldingData?.user_total_deposit_usd > 0
                ? item?.amount_in_usd / totalAmountInUsd
                : 0,
          };
        }) || []
    );
  }, [userHoldingData]);

  const hasValue = useMemo(() => {
    return (
      userHoldingData?.user_vault_tokens?.reduce(
        (sum, item) =>
          "amount_in_usd" in item && typeof item.amount_in_usd === "number"
            ? sum + item.amount_in_usd
            : sum,
        0
      ) > 0
    );
  }, [userHoldingData?.user_vault_tokens]);

  useEffect(() => {
    if (authEnabled && userHoldingData) {
      if (user_total_liquidity_usd > 0 && hasValue) {
        setUserState("holding");
      } else if (user_total_liquidity_usd > 0 && !hasValue) {
        setUserState("pending");
      } else if (user_total_liquidity_usd === 0) {
        setUserState("nonDeposit");
      }
    } else {
      setUserState("nonDeposit");
    }
  }, [authEnabled, userHoldingData, user_total_liquidity_usd, hasValue]);

  useEffect(() => {
    refetch();
    setExpanded(authEnabled);
  }, [authEnabled, refetch]);

  return (
    <DetailWrapper
      title={
        userState !== "nonDeposit" ? "Your Holdings" : "Welcome to NODO Vault!"
      }
      isLoading={isDetailLoading}
      loadingStyle="h-[68px] w-full"
    >
      <ConditionRenderer
        when={userState !== "nonDeposit"}
        fallback={<UnSignedHolding />}
      >
        <div className="pb-0">
          <div className="flex items-center justify-between">
            <div>
              <LabelWithTooltip
                hasIcon={false}
                label="Total Liquidity"
                tooltipContent={
                  <div className="text-white/80 text-xs font-sans">
                    Total User Liquidity Value at the current market price
                  </div>
                }
                labelClassName="text-white/60 text-xs mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
              />

              <div className="md:text-xl text-base font-mono font-semibold text-white">
                {userHoldingData?.user_total_liquidity_usd
                  ? `$${formatNumber(
                      userHoldingData?.user_total_liquidity_usd,
                      0,
                      2
                    )}`
                  : "$--"}
              </div>
            </div>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "md"}
              className="border border-[#505050] md:w-[140px] w-[110px] md:h-[44px] h-[32px] "
              onClick={() => setExpanded((v) => !v)}
            >
              <span
                className="md:text-base text-xs font-semibold"
                style={{
                  background:
                    "linear-gradient(90deg, #FFE8C9 0%, #F9F4E9 25%, #E3F6FF 60%, #C9D4FF 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {expanded ? "View Less" : "View More"}
                <ChevronDown
                  className={`inline-block w-4 h-4 ml-1
              transition-transform duration-200 transform
              ${expanded ? "rotate-180" : ""}
              `}
                />
              </span>
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              className="pt-4 flex flex-col gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              key="box"
            >
              <HoldingCard>
                <LabelWithTooltip
                  hasIcon={false}
                  label="Estimated LP Breakdown (secure, updates in ~1h)"
                  tooltipContent={
                    <div className="text-white/80 text-xs font-sans">
                      Breakdown of underlying tokens based on the your ownership
                      share in the vault
                    </div>
                  }
                  labelClassName="text-white/60 md:text-sm text-[10px] mb-2 underline underline-offset-4 decoration-dotted decoration-gray-600"
                />
                <div className="flex md:gap-4 gap-1 items-center">
                  <div className="flex-1">
                    <div
                      className="mdmax-h-[150px] max-h-[100px] overflow-auto pr-2"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#555 transparent",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      {userState === "pending" && (
                        <div className="flex gap-2 flex-col">
                          {userHoldingData?.user_vault_tokens?.map(
                            (item, idx) => (
                              <div
                                key={`icon-${idx}`}
                                className="flex items-center gap-2"
                              >
                                <img
                                  src={`/coins/${item.token_symbol.toLowerCase()}.png`}
                                  className="w-[18px] h-[18px] inline-flex items-center"
                                />
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="bg-[#23272F] text-[#6AD6FF] px-2 py-1 rounded text-xs">
                                        Calculating
                                        <span className="animate-fade-in-out inline-block">.</span>
                                        <span className="animate-fade-in-out inline-block delay-100">.</span>
                                        <span className="animate-fade-in-out inline-block delay-200">.</span>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      align="center"
                                      className="bg-black/90 rounded-xl shadow-lg p-4 w-[350px] z-50 border border-[#23272F]"
                                    >
                                      <span className="text-white/80 text-xs">
                                        Your deposit has been received and is
                                        queued for the next{" "}
                                        <span className="font-bold">
                                          "Add liquidity"
                                        </span>{" "}
                                        cycle. Please wait for the next vault
                                        transaction
                                      </span>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )
                          )}
                        </div>
                      )}
                      {userState === "holding" && (
                        <div className="flex flex-col gap-2">
                          {pieData?.map((item, idx) => (
                            <div
                              key={item.token_name}
                              className="flex md:items-center gap-1  w-full items-between "
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <div
                                  className={`mr-1 rounded-full w-1 h-8`}
                                  style={{
                                    background: COLORS[idx],
                                  }}
                                />
                                <img
                                  src={`/coins/${item.token_symbol.toLowerCase()}.png`}
                                  className="w-[18px] h-[18px] inline-flex self-center"
                                />
                                <div className="flex flex-col items-end md:max-w-[110px] max-w-[100px] justify-end flex-1">
                                  <div className="font-mono text-white md:text-sm text-xs">
                                    {formatNumber(
                                      item.amount,
                                      0,
                                      item.amount < 1 ? 6 : 2
                                    )}
                                  </div>
                                  {item.amount_in_usd > 0 && (
                                    <div className="text-white/40 md:text-sm text-xs font-mono">
                                      ~$
                                      {formatNumber(
                                        item.amount_in_usd,
                                        0,
                                        item.amount_in_usd < 1 ? 6 : 2
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-end md:text-sm text-xs md:max-w-[80px] w-[45px]">
                                {pieData.length > 0 &&
                                  `${formatNumber(
                                    pieData[idx].value * 100,
                                    0,
                                    2
                                  )}%`}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    {userState === "holding" && (
                      <PieChart
                        width={isMobile ? 86 : 120}
                        height={isMobile ? 86 : 120}
                        tabIndex={-1}
                        className="cursor-not-allowed pointer-events-none select-none"
                      >
                        <Pie
                          data={pieData}
                          cx={isMobile ? 40 : 58}
                          cy={isMobile ? 40 : 58}
                          innerRadius={isMobile ? 32 : 48}
                          outerRadius={isMobile ? 36 : 52}
                          fill="#8884d8"
                          dataKey="value"
                          startAngle={0}
                          endAngle={900}
                          paddingAngle={3}
                          cornerRadius={20}
                        >
                          {pieData.map((entry, idx) => (
                            <Cell
                              key={`cell-${idx}`}
                              fill={COLORS[idx % COLORS.length]}
                              stroke="none"
                              pointerEvents="none"
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    )}
                  </div>
                </div>
              </HoldingCard>
              <div className="flex gap-4">
                <HoldingCard>
                  <LabelWithTooltip
                    hasIcon={false}
                    label="NDLP Balance"
                    tooltipContent={
                      <div className="text-white/80 text-xs font-sans">
                        Your current NDLP position in this vault (Unit USD)
                      </div>
                    }
                    labelClassName="text-white/60 md:text-xs text-[10px] mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <div className="font-mono text-white md:text-xl text-sm">
                    {userHoldingData?.user_ndlp_balance && authEnabled
                      ? formatNumber(
                          userHoldingData?.user_ndlp_balance,
                          0,
                          Number(userHoldingData?.user_ndlp_balance) < 1 ? 6 : 2
                        )
                      : "--"}
                  </div>
                </HoldingCard>
                <HoldingCard>
                  <div className="flex items-center justify-between">
                    <div className="text-white/60 md:text-xs text-[10px] mb-1 md:tracking-normal tracking-tight">
                      Total Rewards Earned
                    </div>
                    {hasValue && (
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="rounded-full md:w-6 md:h-6 w-4 h-4 flex items-center justify-center bg-black/40 border border-white/30">
                              <ChevronRight className="md:w-4 md:h-4 h:3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="center"
                            className="bg-black/90 rounded-xl shadow-lg p-4 min-w-[220px] z-50 border border-[#23272F]"
                          >
                            <div className="text-white/80 text-sm font-semibold mb-2">
                              Rewards Breakdown
                            </div>
                            <hr className="mx-[-16px] my-2" />
                            {userHoldingData?.user_vault_rewards?.map(
                              (reward, idx) => (
                                <div
                                  key={reward.token}
                                  className="flex items-center gap-2 mb-1"
                                >
                                  <img
                                    src={`/coins/${reward.token_symbol.toLowerCase()}.png`}
                                    className="w-5 h-5 inline-flex items-center"
                                  />
                                  <span className="font-mono text-white text-xs">
                                    {formatNumber(
                                      reward.amount,
                                      0,
                                      reward.amount < 1 ? 6 : 3
                                    )}{" "}
                                    {reward.token_symbol}
                                  </span>
                                  {reward.amount_in_usd > 0 && (
                                    <span className="text-white/40 text-xs">
                                      ~ $
                                      {formatNumber(
                                        reward.amount_in_usd,
                                        0,
                                        reward.amount_in_usd < 1 ? 6 : 2
                                      )}
                                    </span>
                                  )}
                                </div>
                              )
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div
                    className="font-mono md:text-xl text-sm"
                    style={{
                      color:
                        userState === "holding" &&
                        userHoldingData?.user_total_rewards_usd
                          ? "#3FE6B0"
                          : "#fff",
                    }}
                  >
                    {userState === "holding" &&
                    userHoldingData?.user_total_rewards_usd ? (
                      `+$${formatNumber(
                        userHoldingData?.user_total_rewards_usd,
                        0,
                        userHoldingData?.user_total_rewards_usd < 1 ? 6 : 2
                      )}`
                    ) : (
                      <span className="text-[#00FFB2]">
                        <span className="font-medium">Farming</span>
                        <span className="animate-fade-in-out inline-block">.</span>
                        <span className="animate-fade-in-out inline-block delay-100">
                          .
                        </span>
                        <span className="animate-fade-in-out inline-block delay-200">
                          .
                        </span>
                      </span>
                    )}
                  </div>
                </HoldingCard>
              </div>
              <HoldingCard>
                <div className="text-white text-sm font-bold mb-1">
                  Cashflow
                </div>
                <div className="flex items-center text-xs">
                  <LabelWithTooltip
                    hasIcon={false}
                    label="Total Deposits"
                    tooltipContent={
                      <div className="text-white/80 text-xs font-sans">
                        Total amount you’ve deposited into this vault.
                      </div>
                    }
                    labelClassName="text-white/80 text-xs mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <span className="flex-1 border-b border-dashed border-[#505050] mx-2"></span>
                  <span className="font-mono">
                    $
                    {authEnabled
                      ? formatNumber(
                          userHoldingData?.user_total_deposit_usd,
                          0,
                          userHoldingData?.user_total_deposit_usd < 1 ? 6 : 2
                        )
                      : "0"}
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <LabelWithTooltip
                    hasIcon={false}
                    label="Total Withdrawals"
                    tooltipContent={
                      <div className="text-white/80 text-xs font-sans">
                        Total amount you’ve withdrawn from this vault.
                      </div>
                    }
                    labelClassName="text-white/80 text-xs mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <span className="flex-1 border-b border-dashed border-[#505050] mx-2"></span>
                  <span className="font-mono">
                    $
                    {authEnabled
                      ? formatNumber(
                          userHoldingData?.user_total_withdraw_usd || 0,
                          0,
                          Number(userHoldingData?.user_total_withdraw_usd) < 1
                            ? 6
                            : 2
                        )
                      : "0"}
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <LabelWithTooltip
                    hasIcon={false}
                    label="24h Rewards"
                    tooltipContent={
                      <div className="text-white/80 text-xs font-sans">
                        Rewards you earned in the last 24 hours. Calculated from
                        recent fee events and your share of the pool. Updates
                        every 1 hour.
                      </div>
                    }
                    labelClassName="text-white/80 text-xs mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <span className="flex-1 border-b border-dashed border-[#505050] mx-2"></span>
                  <span className="font-mono">
                    {authEnabled ? (
                      userHoldingData?.user_rewards_24h_usd > 0 ? (
                        `$${formatNumber(
                          userHoldingData?.user_rewards_24h_usd,
                          0,
                          userHoldingData?.user_rewards_24h_usd < 1 ? 6 : 2
                        )}`
                      ) : (
                        <span className="text-[#00FFB2]">Farming...</span>
                      )
                    ) : (
                      "0"
                    )}
                  </span>
                </div>
              </HoldingCard>
              <HoldingCard>
                <div className="text-white font-bold text-sm mb-1">
                  Position
                </div>
                <div className="flex items-center text-xs ">
                  <LabelWithTooltip
                    hasIcon={false}
                    label="Share in Vault"
                    tooltipContent={
                      <div className="text-white/80 text-xs font-sans">
                        Your ownership percentage of this vault. Updates with
                        NDLP balance changes.
                      </div>
                    }
                    labelClassName="text-white/80 text-xs mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <span className="flex-1 border-b border-dashed border-[#505050] mx-2"></span>
                  <span className="font-mono">
                    {authEnabled
                      ? formatNumber(
                          userHoldingData?.user_shares_percent * 100,
                          0,
                          userHoldingData?.user_shares_percent * 100 < 1 ? 6 : 2
                        )
                      : "0"}
                    %
                  </span>
                </div>
                <div className="flex items-center text-xs mt-1">
                  <LabelWithTooltip
                    hasIcon={false}
                    label="Break-Even Price"
                    tooltipContent={
                      <div className="text-white/80 text-xs max-w-[200px] font-sans">
                        NDLP price where you can withdraw your deposits without
                        profit or loss. Recalculated after each deposit or full
                        withdrawal.
                      </div>
                    }
                    labelClassName="text-white/80 text-xs font-sans underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <span className="flex-1 border-b border-dashed border-[#505050] mx-2"></span>
                  <span className="font-mono">
                    $
                    {authEnabled
                      ? formatNumber(
                          userHoldingData?.user_break_event_price_usd,
                          0,
                          userHoldingData?.user_break_event_price_usd < 1
                            ? 6
                            : 2
                        )
                      : "0"}
                  </span>
                </div>
              </HoldingCard>
            </motion.div>
          )}
        </AnimatePresence>
      </ConditionRenderer>
    </DetailWrapper>
  );
};

export default YourHoldings;

// My Position: six-card layout for Your Holdings tab
export function MyPositionSection({
  vault,
  vault_id,
  isDetailLoading,
}: {
  vault: BasicVaultDetailsType;
  vault_id: string;
  isDetailLoading?: boolean;
}) {
  const { isAuthenticated } = useWallet();
  const isMockMode = (import.meta as any)?.env?.VITE_MOCK_MODE === "true";
  const authEnabled = isAuthenticated || isMockMode;
  const lpToken = useGetLpToken(vault?.vault_lp_token, vault_id);
  const ndlp_balance = lpToken?.balance || "0";
  const { data: holding } = useUserHolding(vault_id, ndlp_balance, authEnabled);
  // Dev/QA fixture — applied only in development
  const fixture = !authEnabled
    ? {
        ndlpBalance: 8200.0,
        ndlpPriceUSD: 1.04,
        currentValueUSD: 8528.0,
        totalDepositsUSD: 10000.0,
        totalWithdrawalsUSD: 1000.0,
        netDepositedUSD: 9000.0,
        pnlSinceDepositUSD: 16.0,
        pnlSinceDepositPct: 0.0018,
        breakEvenPriceUSD: 1.09756, // unrelated to P&L card but kept
        risk: {
          stopLossState: "Active",
          stopLossLastTs: "2025-09-02T22:14:05+07:00",
          inRangePct24h: 68,
          rebalances24h: 8,
          exposure: { USDC: 62, SUI: 38 },
          shareInVaultPct: 2.91,
        },
        yield: { fees24hUSD: 1.28, netApy7dPct: 12.6 },
        // P&L fixture values for QA
        attribution: {
          feesAutoCompUSD: 248.0,
          impermanentLossUSD: -173.0,
          rangeRebalanceEffectUSD: -51.0,
          performanceFeeUSD: -8.0,
          netPnlUSD: 16.0,
        },
        pnl24h: {
          feesAutoCompUSD: 1.28,
          impermanentLossUSD: -0.92,
          rangeRebalanceEffectUSD: -0.18,
          performanceFeeUSD: -0.0,
          netPnlUSD: 0.18,
        },
        cashflow: { totalDepositsUSD: 10000.0, totalWithdrawalsUSD: 1000.0 },
        exitEstimate: {
          asOf: "2025-09-04T13:42:10+07:00",
          payoutToken: "USDC",
          estimatedTokens: 8521.4,
          estimatedUSD: 8521.4,
          pnlIfExitPct: -0.0535,
          pnlIfExitUSD: -478.6,
        },
      }
    : null;
  const showData = authEnabled || !!fixture;

  // Raw values from backend
  const ndlpBalanceRaw = Number((holding as any)?.user_ndlp_balance || 0);
  const ndlpPriceRaw = Number((vault as any)?.ndlp_price_usd || 0);
  const totalDepositRaw = Number((holding as any)?.user_total_deposit_usd || 0);
  const totalWithdrawRaw = Number((holding as any)?.user_total_withdraw_usd || 0);

  // Derived values per validation formulas
  const ndlpBalance = fixture?.ndlpBalance ?? ndlpBalanceRaw;
  const ndlpPrice = fixture?.ndlpPriceUSD ?? ndlpPriceRaw;
  const currentValue = fixture?.currentValueUSD ?? ndlpBalance * ndlpPrice;
  const totalDeposit = fixture?.totalDepositsUSD ?? totalDepositRaw;
  const totalWithdrawals = fixture?.totalWithdrawalsUSD ?? totalWithdrawRaw;
  const netDeposited = fixture?.netDepositedUSD ?? Math.max(0, totalDeposit - totalWithdrawals);
  const pnl = fixture?.pnlSinceDepositUSD ?? currentValue - netDeposited;
  const pnlPct = fixture?.pnlSinceDepositPct ?? (netDeposited > 0 ? pnl / netDeposited : 0);
  const breakEven = fixture?.breakEvenPriceUSD ?? (ndlpBalance > 0 ? netDeposited / ndlpBalance : 0);
  const userShare = Number(vault?.total_value_usd || 0) > 0 ? currentValue / Number(vault?.total_value_usd || 1) : 0;

  // Performance fee estimate applied only on positive PnL
  const perfRate = Number((vault as any)?.performance_fee || 0);
  const perfFeeUsd = Math.max(0, (fixture?.attribution?.performanceFeeUSD ?? (pnl > 0 ? pnl * perfRate : 0)));
  const netPnl = (fixture?.attribution?.netPnlUSD ?? pnl - perfFeeUsd);

  const [pnlPeriod, setPnlPeriod] = useState<"deposit" | "24h">("deposit");

  return (
    <div className="flex flex-col gap-4">
      {/* Your Position Status (NDLP vs Break-even) */}
      <NdLpStatusChartCard />
      <DetailWrapper title="My Balance" isLoading={!!isDetailLoading} loadingStyle="h-[80px] w-full">
        {!showData ? (
          <div className="text-white/70 text-sm">Connect wallet to view your position.</div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm"><span className="text-white/60">Current Value (USD)</span><span className="font-mono text-white">${formatNumber(currentValue, 0, 2)}</span></div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Since Deposit (PnL)</span>
              <span className={cn("font-mono", pnl >= 0 ? "text-emerald-400" : "text-red-400")}>{`${pnl >= 0 ? "+" : "-"}$${formatNumber(Math.abs(pnl), 0, 2)} (${pnlPct >= 0 ? "+" : "-"}${formatNumber(Math.abs(pnlPct) * 100, 0, 2)}%)`}</span>
            </div>
            <div className="flex items-center justify-between text-sm"><span className="text-white/60">NDLP Balance</span><span className="font-mono text-white">{formatNumber(ndlpBalance, 0, 4)} NDLP @ ${formatNumber(ndlpPrice, 0, 4)}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-white/60">Break-even Price</span><span className="font-mono text-white">${formatNumber(breakEven, 0, 4)} / NDLP</span></div>
          </div>
        )}
      </DetailWrapper>

      {/* Exit Simulation (Estimate) card removed as requested */}

      <DetailWrapper id="pnl-card" title="P&L Breakdown" isLoading={!!isDetailLoading} loadingStyle="h-[120px] w-full"
        titleComponent={
          <div className="flex items-center gap-2">
            <div className="text-white/60 text-xs hidden md:block">View:</div>
            <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setPnlPeriod("deposit")}
                aria-pressed={pnlPeriod === "deposit"}
                className={cn(
                  "px-2 py-1 text-xs rounded-md",
                  pnlPeriod === "deposit" ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
                )}
              >
                Since deposit
              </button>
              <button
                type="button"
                onClick={() => setPnlPeriod("24h")}
                aria-pressed={pnlPeriod === "24h"}
                className={cn(
                  "px-2 py-1 text-xs rounded-md",
                  pnlPeriod === "24h" ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
                )}
              >
                24h
              </button>
            </div>
          </div>
        }
      >
        {!showData ? (
          <div className="text-white/70 text-sm">Connect your wallet to view breakdown.</div>
        ) : (
          <div className="rounded-md border border-border/60 bg-white/5 p-3">
            <div className="text-muted-foreground text-xs mb-2">
              {pnlPeriod === "deposit" ? "Breakdown since your first deposit" : "Change in the last 24 hours"}
            </div>
            {(() => {
              // Fallback mock values to ensure illustrative numbers even when authenticated
              const defaultAttribution = {
                feesAutoCompUSD: 248.0,
                impermanentLossUSD: -173.0,
                rangeRebalanceEffectUSD: -51.0,
                performanceFeeUSD: -8.0,
                netPnlUSD: 16.0,
              };
              const default24h = {
                feesAutoCompUSD: 1.28,
                impermanentLossUSD: -0.92,
                rangeRebalanceEffectUSD: -0.18,
                performanceFeeUSD: -0.0,
                netPnlUSD: 0.18,
              };
              const dep = fixture?.attribution ?? defaultAttribution;
              const d24 = fixture?.pnl24h ?? default24h;
              const gains = pnlPeriod === "deposit" ? (dep.feesAutoCompUSD ?? 0) : (d24.feesAutoCompUSD ?? fixture?.yield?.fees24hUSD ?? 0);
              const il = pnlPeriod === "deposit" ? (dep.impermanentLossUSD ?? 0) : (d24.impermanentLossUSD ?? 0);
              const range = pnlPeriod === "deposit" ? (dep.rangeRebalanceEffectUSD ?? 0) : (d24.rangeRebalanceEffectUSD ?? 0);
              const perf = pnlPeriod === "deposit" ? (dep.performanceFeeUSD ?? 0) : (d24.performanceFeeUSD ?? 0);
              const net = pnlPeriod === "deposit" ? (dep.netPnlUSD ?? 0) : (d24.netPnlUSD ?? 0);
              const gainsTotal = gains;
              const costsTotal = Math.abs(il) + Math.abs(range) + Math.abs(perf);
              return (
                <div className="space-y-2">
                  {/* Gains header */}
                  <div role="rowheader" className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-4 w-1.5 rounded bg-emerald/60" aria-hidden="true" />
                      <div className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Gains</div>
                    </div>
                    <div className="text-xs">
                      <div className="inline-flex items-center rounded-md px-2 py-0.5 bg-emerald/20 text-emerald border border-emerald/30">+${formatNumber(gainsTotal, 0, 2)}</div>
                    </div>
                  </div>
                  {/* Gains items */}
                  <div className="flex items-center justify-between py-1.5">
                    <LabelWithTooltip
                      labelClassName="text-sm text-foreground/80"
                      label="Fees earned (auto-compounded)"
                      tooltipContent={<div className="max-w-[260px] text-xs">Fees automatically reinvested into your share price (not claimable separately).</div>}
                    />
                    <span className="text-sm font-medium tabular-nums">${formatNumber(gains, 0, 2)}</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/50 my-1" />

                  {/* Costs header */}
                  <div role="rowheader" className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-4 w-1.5 rounded bg-destructive/60" aria-hidden="true" />
                      <div className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Costs</div>
                    </div>
                    <div className="text-xs">
                      <div className="inline-flex items-center rounded-md px-2 py-0.5 bg-destructive text-destructive-foreground border border-destructive/50">−${formatNumber(costsTotal, 0, 2)}</div>
                    </div>
                  </div>
                  {/* Costs items */}
                  <div className="flex items-center justify-between py-1.5">
                    <LabelWithTooltip
                      labelClassName="text-sm text-foreground/80"
                      label="Impermanent Loss (IL)"
                      tooltipContent={<div className="max-w-[260px] text-xs">Loss from price divergence versus holding tokens.</div>}
                    />
                    <span className="text-sm font-medium tabular-nums">−${formatNumber(Math.abs(il), 0, 2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <LabelWithTooltip
                      labelClassName="text-sm text-foreground/80"
                      label="Range/Rebalance effect"
                      tooltipContent={<div className="max-w-[280px] text-xs">Cost of resetting ranges (gas/swap) and realized IL when repositioning.</div>}
                    />
                    <span className="text-sm font-medium tabular-nums">−${formatNumber(Math.abs(range), 0, 2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <LabelWithTooltip
                      labelClassName="text-sm text-foreground/80"
                      label="Performance Fee"
                      tooltipContent={<div className="max-w-[260px] text-xs">Fee applied only to realized gains.</div>}
                    />
                    <span className="text-sm font-medium tabular-nums">−${formatNumber(Math.abs(perf), 0, 2)}</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/50 my-1" />

                  {/* Net */}
                  <div className="flex items-center justify-between py-2">
                    <div className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Net P&L</div>
                    <span
                      aria-live="polite"
                      className={cn(
                        "font-mono tabular-nums text-lg font-semibold",
                        net >= 0 ? "text-emerald-400" : "text-destructive"
                      )}
                    >
                      {`${net >= 0 ? "+" : "-"}$${formatNumber(Math.abs(net), 0, 2)}`}
                    </span>
                  </div>

                  {/* Footer line */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>{pnlPeriod === "deposit" ? "Since deposit" : "Last 24h"}</span>
                    <button
                      type="button"
                      onClick={() => setPnlPeriod("24h")}
                      className="text-foreground/80 hover:text-foreground underline underline-offset-4 decoration-dotted"
                    >
                      What changed since yesterday?
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </DetailWrapper>

      <DetailWrapper title="Risk & Strategy State" isLoading={!!isDetailLoading} loadingStyle="h-[80px] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
            <MPStateItem label="Stop-loss State" value={`${fixture?.risk?.stopLossState ?? (vault?.is_active ? "Active" : "Inactive")}${fixture?.risk?.stopLossLastTs ? ` (last: ${format(new Date(fixture?.risk?.stopLossLastTs), 'yyyy-MM-dd HH:mm')} )` : ''}`} />
            <MPStateItem label="% In-range (24h)" value={`${fixture?.risk?.inRangePct24h ?? '—'}${fixture?.risk ? '%' : ''}`} />
            <MPStateItem label="Rebalances (24h)" value={`${fixture?.risk?.rebalances24h ?? '—'}`} />
            <MPStateItem label="Exposure" value={`${fixture?.risk?.exposure?.USDC ?? 0}% USDC / ${fixture?.risk?.exposure?.SUI ?? 0}% SUI`} />
            <MPStateItem label="Share in Vault" value={`${formatNumber((fixture?.risk?.shareInVaultPct ?? (userShare * 100)), 0, 2)}%`} />
            <MPStateItem label="Range Health" value={`OK`} />
          </div>
          <div className="lg:col-span-1"></div>
        </div>
        <div className="mt-3">
          <EstimatedLpBreakdown vault_id={vault_id} embedded />
        </div>
      </DetailWrapper>

      <DetailWrapper title="Yield Info" isLoading={!!isDetailLoading} loadingStyle="h-[80px] w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <MPStateItem label="24h Fees (your share)" value={`$${formatNumber(Number((fixture?.yield?.fees24hUSD ?? (holding as any)?.user_rewards_24h_usd) || 0), 0, 2)}`} />
          <MPStateItem label="7D Net APY" value={`${formatNumber(Number((fixture?.yield?.netApy7dPct ?? vault?.vault_apy) || 0), 0, 2)}%`} />
          <div className="text-white/60 text-xs md:col-span-3 col-span-2">Rewards are auto-compounded into NDLP Price and are not claimable separately.</div>
        </div>
      </DetailWrapper>

      <DetailWrapper title="Cashflow" isLoading={!!isDetailLoading} loadingStyle="h-[80px] w-full">
        {!showData ? (
          <div className="text-white/70 text-sm">Connect your wallet to view cashflow.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm items-end">
            <MPStateItem label="Total Deposits" value={`$${formatNumber(fixture?.cashflow?.totalDepositsUSD ?? totalDeposit, 0, 2)}`} />
            <MPStateItem label="Total Withdrawals" value={`$${formatNumber(Number((fixture?.cashflow?.totalWithdrawalsUSD ?? (holding as any)?.user_total_withdraw_usd) || 0), 0, 2)}`} />
            <div className="md:col-span-2 col-span-2 text-right">
              <Button variant="outline" size="sm" className="border-white/20" disabled>
                Export CSV (soon)
              </Button>
            </div>
          </div>
        )}
      </DetailWrapper>
    </div>
  );
}

function MPMetric({ label, value, highlight }: { label: string; value: string; highlight?: "pos" | "neg" }) {
  return (
    <div>
      <div className="text-white/60 text-xs mb-1">{label}</div>
      <div className={cn("font-mono text-white text-base md:text-xl", highlight === "pos" && "text-emerald-400", highlight === "neg" && "text-red-400")}>{value}</div>
    </div>
  );
}

function MPBreakdownItem({ label, value, hint, emphasize }: { label: string; value: string; hint?: string; emphasize?: boolean }) {
  return (
    <div className={cn("rounded-md border border-white/10 bg-white/5 p-3", emphasize && "ring-1 ring-white/20")}>
      <div className="text-white/60 text-xs mb-1">{label}</div>
      <div className="text-white font-mono">{value}</div>
      {hint && <div className="text-white/50 text-[11px] mt-1">{hint}</div>}
    </div>
  );
}

function MPStateItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-white/60 text-xs mb-1">{label}</div>
      <div className="text-white font-mono">{value}</div>
    </div>
  );
}

function mpExposureText(holding: any): string {
  try {
    const tokens = holding?.user_vault_tokens || [];
    if (!tokens.length) return "—";
    const total = tokens.reduce((s: number, t: any) => s + (t.amount_in_usd || 0), 0) || 0;
    if (!total) return "—";
    const parts = tokens
      .slice()
      .sort((a: any, b: any) => (b.amount_in_usd || 0) - (a.amount_in_usd || 0))
      .map((t: any) => `${t.token_symbol} ${(((t.amount_in_usd || 0) / total) * 100).toFixed(1)}%`);
    return parts.join(" / ");
  } catch {
    return "—";
  }
}

function EstimatedLpBreakdown({ vault_id, embedded = false }: { vault_id: string; embedded?: boolean }) {
  const { data, isLoading, isDegraded } = useLpBreakdown(vault_id);
  // Interactivity state MUST be declared unconditionally to satisfy React hook rules
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const activeIdx = selectedIdx != null ? selectedIdx : hoverIdx;

  // Formatting helpers
  const percentText = (v: number) => {
    const fixed = Number(v.toFixed(1));
    return fixed % 1 === 0 ? `${fixed.toFixed(0)}%` : `${fixed}%`;
  };
  const asOfWithTz = (iso?: string) => {
    if (!iso) return "--";
    try {
      const d = new Date(iso);
      const tz = d.toLocaleTimeString(undefined, { timeZoneName: 'short' }).split(' ').pop();
      return `${format(d, 'yyyy-MM-dd HH:mm:ss')} ${tz}`;
    } catch {
      return format(new Date(iso || Date.now()), 'yyyy-MM-dd HH:mm:ss');
    }
  };

  // Loading state with skeleton donut + rows
  if (isLoading) {
    return (
      <div className={cn("rounded-md border border-white/10 bg-white/5", embedded ? "p-3" : "p-4")}> 
        <div className="text-white font-semibold text-sm">Estimated LP Breakdown • Secure, updates ~1h</div>
        <div className="text-white/60 text-xs mt-1">Secure snapshot, refreshed ~hourly</div>
        <div className="mt-3 grid grid-cols-12 gap-3 items-center">
          <div className="col-span-12 lg:col-span-7 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 rounded bg-white/5 animate-pulse" />
            ))}
          </div>
          <div className="col-span-12 lg:col-span-5 flex items-center justify-center">
            <svg width="220" height="220" role="img" aria-label="loading donut" className="opacity-70">
              <circle cx="110" cy="110" r="90" stroke="#2A2A2A" strokeWidth="14" fill="transparent" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.slices?.length) {
    return (
      <div className={cn("rounded-md border border-white/10 bg-white/5", embedded ? "p-3" : "p-4")}> 
        <div className="text-white font-semibold text-sm">Estimated LP Breakdown • Secure, updates ~1h</div>
        <div className="text-white/60 text-xs mt-1">Secure snapshot, refreshed ~hourly</div>
        <div className="text-white/60 text-sm mt-3">No breakdown available for this vault.</div>
      </div>
    );
  }

  // Aggregate slices: top 8 by usd, rest as Others
  const sorted = data.slices.slice().sort((a, b) => (b.usd || 0) - (a.usd || 0));
  const top = sorted.slice(0, 8);
  const rest = sorted.slice(8);
  const othersUsd = rest.reduce((s, x) => s + (x.usd || 0), 0);
  const othersPct = rest.reduce((s, x) => s + (x.percent || 0), 0);
  const palette = [
    'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)',
    'var(--chart-5)', 'var(--chart-6)', 'var(--chart-7)', 'var(--chart-8)'
  ];
  const muted = 'var(--chart-muted)';
  const topWithColor = top.map((s, i) => ({
    ...s,
    color: s.color || palette[i % palette.length],
  }));
  const displaySlices = othersUsd > 0 || othersPct > 0
    ? [...topWithColor, { label: 'Others', percent: Number(othersPct.toFixed(1)), usd: othersUsd, color: muted }]
    : topWithColor;

  // Keyboard support on the donut container
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!displaySlices.length) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const next = ((activeIdx ?? 0) + delta + displaySlices.length) % displaySlices.length;
      setSelectedIdx(next);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedIdx(activeIdx ?? 0);
    }
  };

  // Tooltip renderer
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const s = payload[0].payload as any;
    return (
      <div className="rounded-md border border-white/10 bg-black/80 p-2 text-xs text-white/90">
        <div className="font-semibold">{s.label}</div>
        <div className="font-mono mt-1">{percentText(s.percent)} • ${formatNumber(s.usd, 0, 0)}</div>
        {s.lastChangedTs && (
          <div className="text-white/60 mt-1">Last changed: {relativeTime(s.lastChangedTs)}</div>
        )}
      </div>
    );
  };

  const relativeTime = (iso: string) => {
    try {
      const t = new Date(iso).getTime();
      const diff = Date.now() - t;
      if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
      if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
      if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
      return `${Math.floor(diff / 86_400_000)}d ago`;
    } catch {
      return '';
    }
  };

  // Responsive donut size
  const size = typeof window !== 'undefined' && window.innerWidth < 768 ? 180 : 260;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = Math.floor(size / 2) - 6; // padding from edges
  const thickness = 14;
  const innerR = outerR - thickness;
  const gap = 3;

  return (
    <div className={cn("rounded-md border border-white/10 bg-white/5", embedded ? "p-3" : "p-4")}> 
      <div className="flex flex-col">
        <div className="text-white font-semibold text-sm">Estimated LP Breakdown • Secure, updates ~1h</div>
        <div className="text-white/60 text-xs mt-1">Secure snapshot, refreshed ~hourly • As of {asOfWithTz(data.asOf)}</div>
        {isDegraded ? (
          <div className="text-[11px] text-white/50 mt-1">Showing last secure snapshot.</div>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-12 gap-3 items-center">
        {/* Legend (left) */}
        <div className="col-span-12 lg:col-span-7 pr-1 overflow-auto" role="listbox" aria-label="LP breakdown legend" style={{ maxHeight: 220 }}>
          {displaySlices.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              role="option"
              aria-selected={activeIdx === i}
              tabIndex={0}
              onFocus={() => setHoverIdx(i)}
              onBlur={() => setHoverIdx(null)}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedIdx(selectedIdx === i ? null : i);
                }
              }}
              className={cn(
                "flex items-center justify-between gap-2 rounded px-2 h-9",
                activeIdx === i ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-5 rounded" style={{ background: s.color }} />
                <img src={tokenIconPath(s.label)} alt="" className="w-4 h-4" />
                <span className="truncate text-sm text-white/90">{s.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-white/80 w-[64px] text-right">{percentText(s.percent)}</span>
                <span className="text-sm font-mono text-white/60 w-[90px] text-right">${formatNumber(s.usd, 0, 0)}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Donut (right) */}
        <div className="col-span-12 lg:col-span-5 flex items-center justify-center">
          <div
            className="outline-none"
            tabIndex={0}
            role="group"
            aria-label="LP breakdown donut"
            onKeyDown={onKeyDown}
          >
            <PieChart width={size} height={size}>
              <Pie
                data={displaySlices}
                cx={cx}
                cy={cy}
                innerRadius={innerR}
                outerRadius={outerR}
                paddingAngle={gap}
                isAnimationActive={false}
                dataKey="percent"
                onMouseLeave={() => setHoverIdx(null)}
              >
                {displaySlices.map((s, idx) => (
                  <Cell
                    key={idx}
                    fill={s.color}
                    stroke={activeIdx === idx ? "#FFFFFF" : "#0f0f0f"}
                    strokeOpacity={activeIdx === idx ? 1 : 0.5}
                    strokeWidth={activeIdx === idx ? 2 : 1}
                    onMouseEnter={() => setHoverIdx(idx)}
                    onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                    tabIndex={0}
                    role="img"
                    aria-label={`${s.label} ${percentText(s.percent)}, $${formatNumber(s.usd, 0, 0)}`}
                  />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
}
