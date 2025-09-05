import DetailsBackground from "@/assets/images/bg-details.webp";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import DepositWithdraw from "@/components/vault-detail/sections/deposit-withdraw";
import HeaderDetail from "@/components/vault-detail/sections/header-detail";
import HelpfulInfo from "@/components/vault-detail/sections/helpful-info";
import StrategyExplanation from "@/components/vault-detail/sections/strategy-explanation";
import VaultActivities from "@/components/vault-detail/sections/vault-activities";
import VaultAnalytics from "@/components/vault-detail/sections/vault-analytics";
import VaultInfo from "@/components/vault-detail/sections/vault-info";
import YourHoldings, { MyPositionSection } from "@/components/vault-detail/sections/your-holdings";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import { useGetDepositVaults, useVaultBasicDetails } from "@/hooks";
import { formatAmount } from "@/lib/utils";
import { BasicVaultDetailsType, DepositVaultConfig } from "@/types/vault-config.types";
import { useMemo } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import useBreakpoint from "@/hooks/use-breakpoint";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type VaultInfo = {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  tooltip?: any;
};

const VaultDetail = () => {
  const { vault_id } = useParams();
  const { data: vaultDetails, isLoading: isLoadingVaultDetails } =
    useVaultBasicDetails(vault_id);
  const { isLg, isMd } = useBreakpoint();
  const {
    data: depositVaults,
    isLoading: isLoadingDepositVaults,
    isFetching: isFetchingDepositVaults,
  } = useGetDepositVaults();

  const depositVault = depositVaults?.find(
    (vault) => vault.vault_id === vault_id
  );

  const vaultListLoaded = depositVaults?.length > 0 && !isLoadingDepositVaults;
  let isValidVault = vaultListLoaded && !!depositVault;
  if (!isValidVault && isFetchingDepositVaults) {
    isValidVault = true;
  }

  const hasDetails = !!vaultDetails;
  const hasFallback = !!depositVault;

  // Fallback: derive minimal BasicVaultDetailsType from list item
  const fromDepositToBasic = (v?: DepositVaultConfig): BasicVaultDetailsType | null => {
    if (!v) return null;
    const exchange = EXCHANGE_CODES_MAP[v.exchange_id] || { name: "", code: "", image: "" };
    return {
      // IDs & names
      id: String(v.id ?? v.vault_id ?? ""),
      vault_id: v.vault_id,
      vault_name: v.vault_name,
      vault_address: v.vault_address,
      vault_module: v.vault_module,
      // Tokens & decimals
      collateral_token: v.collateral_token,
      collateral_token_decimals: v.collateral_token_decimals,
      vault_lp_token: v.vault_lp_token,
      vault_lp_token_decimals: v.vault_lp_token_decimals,
      // Values & metrics
      total_value_usd: v.total_value_usd ?? "0",
      pool_total_value_usd: Number(v.total_value_usd || 0),
      pool_apr: v.vault_apy ?? String(v.apr ?? 0),
      vault_apr: v.vault_apy ?? String(v.apr ?? 0),
      vault_apy: v.vault_apy ?? String(v.apy ?? 0),
      ndlp_price: v.ndlp_price_usd ?? v.ndlp_price ?? "0",
      ndlp_price_usd: v.ndlp_price_usd ?? v.ndlp_price ?? "0",
      ndlp_price_7d: "0",
      ndlp_price_change_7d: 0,
      user_break_even_price: 0,
      rewards_24h_usd: v.rewards_24h_usd ?? "0",
      rewards_24h_daily_rate: 0,
      nodo_share: 0,
      management_fee: 0,
      performance_fee: 0,
      user_balance: 0,
      // Pool & exchange
      pool: {
        pool_id: 0,
        pool_name: v.pool?.pool_name || "",
        exchange_id: v.exchange_id,
        fee_tier: "",
        pool_address: v.pool?.pool_address || "",
        pool_type: "",
        token_a_address: v.pool?.token_a_address || "",
        token_b_address: v.pool?.token_b_address || "",
        created_at: "",
        updated_at: "",
      },
      exchange: exchange.name,
      exchange_id: v.exchange_id,
      tokens: (v.tokens || []).map((t) => ({
        token_id: t.token_id,
        token_symbol: t.token_symbol,
        token_name: t.token_name,
        token_address: t.token_address,
        decimal: t.decimal,
        url: t.url,
        exchange_id: t.exchange_id,
        min_deposit_amount: t.min_deposit_amount,
        min_deposit_amount_usd: "0",
      })),
      reward_tokens: [],
      is_active: v.is_active,
      created_at: "",
      updated_at: "",
      metadata: {
        package_id: v.metadata?.package_id || "",
        vault_module: v.metadata?.vault_module || v.vault_module || "",
        vault_config_id: v.metadata?.vault_config_id || "",
        vault_id: v.vault_id,
        exchange_id: v.exchange_id,
        withdraw_interval: 0,
        pool: v.metadata?.pool || v.pool?.pool_address || "",
        executor: {},
        is_enable_dual_token: false,
      },
      user_pending_withdraw_ndlp: v.user_pending_withdraw_ndlp || "0",
      max_drawdown: "",
      user_investment_usd: 0,
      collateral_price_feed_id: "",
    } as unknown as BasicVaultDetailsType;
  };

  const displayVault =
    (vaultDetails as BasicVaultDetailsType) || fromDepositToBasic(depositVault);

  // Determine final UI state: loading vs render vs not-found
  const canRenderContent = !!displayVault;
  const showNotFound =
    !canRenderContent &&
    !isLoadingVaultDetails &&
    vaultListLoaded &&
    !isLoadingDepositVaults &&
    !isFetchingDepositVaults;
  const isDetailLoading = !canRenderContent && !showNotFound;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refetch: refetchDepositVaults } = useGetDepositVaults();

  const handleBackToHome = () => {
    refetchDepositVaults();
    navigate("/", { replace: true });
  };

  const currentTab = (searchParams.get("tab") as "overview" | "activity" | "position") || "overview";
  const setTab = (t: "overview" | "activity" | "position") => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", t);
    navigate(`${url.pathname}${url.search}`, { replace: true });
    try {
      (window as any)?.analytics?.track?.("vault_detail_tab_click", { tab: t, vaultId: vault_id });
    } catch {}
  };

  const vaultInfo = useMemo(() => {
    return [
      {
        label: "APY",
        tooltip:
          "Your real yearly return with hourly compounding, based on the average APR of the last 7 days. Updates every 1 hour.",
        value: !isDetailLoading
          ? formatAmount({ amount: (displayVault as any)?.vault_apy || 0 })
          : "--",
        suffix: "%",
      },
      {
        label: "TVL",
        tooltip: "Total Liquidity Value at the current market price",
        value: !isDetailLoading
          ? formatAmount({ amount: (displayVault as any)?.total_value_usd || 0 })
          : "--",
        prefix: "$",
      },
      {
        label: "24h Rewards",
        tooltip:
          "Total LP fees and token incentives earned by the vault in the last 24 hours. Updates every 1 hour.",
        value: !isDetailLoading
          ? formatAmount({ amount: (displayVault as any)?.rewards_24h_usd || 0 })
          : "--",
        prefix: "$",
      },
      {
        label: "NDLP Price",
        tooltip:
          "Price of 1 NDLP token based on the vault’s total value. (Unit USD)",
        value: !isDetailLoading
          ? formatAmount({
              amount: (displayVault as any)?.ndlp_price_usd || 0,
              precision: 4,
            })
          : "--",
        prefix: "$",
      },
    ];
  }, [displayVault, isDetailLoading]);

  // Do not redirect; keep skeleton states on page to avoid jarring back navigation

  const tokens =
    ((displayVault as BasicVaultDetailsType)?.pool?.pool_name || "")
      .replace(/\//g, "-")
      .split("-") || [];
  const exchange = EXCHANGE_CODES_MAP[
    (displayVault as BasicVaultDetailsType)?.exchange_id as any
  ] || {
    code: "",
    name: "",
    image: "",
  };

  return (
    <PageContainer
      backgroundImage={DetailsBackground}
      className="max-md:py-4 py-8"
    >
      <Button
        variant="outline"
        className="mb-4 border-white/30 text-sm"
        size={isMd ? "default" : "sm"}
        onClick={handleBackToHome}
      >
        <ChevronLeft className="!w-6 !h-6" />
        AI Vaults
      </Button>
      {/* Not-found guard: show a friendly state if no details nor fallback */}
      {showNotFound ? (
        <div className="rounded-lg bg-[#1C1C1C] border border-white/15 p-6 text-white/80">
          <div className="text-white text-lg font-bold mb-2">Vault not found</div>
          <div className="text-sm mb-4">
            The vault you’re looking for doesn’t exist or is unavailable. Please go back and choose another vault.
          </div>
          <Button variant="outline" onClick={handleBackToHome}>Back to AI Vaults</Button>
        </div>
      ) : (
        <>
      <HeaderDetail
        vault={displayVault}
        exchange={exchange}
        tokens={tokens}
        vaultInfo={vaultInfo}
        vaultDetails={displayVault}
        isDetailLoading={isDetailLoading}
      />
      {/* Tabs below metrics row */}
      <div className="border-t border-white/10 mt-4" />
      <div className="bg-transparent border-b border-white/15">
        <div className="md:p-5 p-4">
          <Tabs value={currentTab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="p-1 flex gap-1 overflow-x-auto no-scrollbar">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">AI Activity</TabsTrigger>
              <TabsTrigger value="position">Your Holdings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Two-column layout: left switches; right sticky aside */}
      <div className="md:p-5 p-4">
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1fr_440px]">
          {/* Left column: tab content */}
          <div className="lg:col-start-1">
            {currentTab === "overview" && (
              <>
                <VaultAnalytics
                  vault_id={vault_id}
                  isDetailLoading={isDetailLoading}
                  vault={displayVault as BasicVaultDetailsType}
                />
                <div className="mt-6" />
                <StrategyExplanation
                  vault={displayVault as BasicVaultDetailsType}
                  isDetailLoading={isDetailLoading}
                />
                <div className="mt-6" />
                <VaultInfo
                  vaultDetails={displayVault as BasicVaultDetailsType}
                  isDetailLoading={isDetailLoading}
                />
                <div className="mt-6" />
                <HelpfulInfo isDetailLoading={isDetailLoading} />
              </>
            )}

            {currentTab === "activity" && (
              <VaultActivities
                isDetailLoading={isDetailLoading}
                vault_id={vault_id}
              />
            )}

            {currentTab === "position" && (
              <MyPositionSection
                isDetailLoading={isDetailLoading}
                vault_id={vault_id as string}
                vault={displayVault as BasicVaultDetailsType}
              />
            )}
          </div>

          {/* Right column: Manage Liquidity (mobile shows first via order) */}
          <aside className="self-start lg:col-start-2 order-first lg:order-none">
            <DepositWithdraw vault_id={vault_id} isDetailLoading={isDetailLoading} />
          </aside>
        </div>
      </div>
        </>
      )}
    </PageContainer>
  );
};

export default VaultDetail;
