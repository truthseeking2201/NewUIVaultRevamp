import { GradientSelect } from "@/components/ui/gradient-select";
import { InputSearch } from "@/components/ui/input-search";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { TableRender } from "@/components/ui/table-render";
import Web3Button from "@/components/ui/web3-button";
import { ButtonGradient } from "@/components/ui/button-gradient";
import { SORT_TYPE } from "@/config/constants-types";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import {
  useGetDepositVaults,
  useNdlpAssetsStore,
  useVaultObjectStore,
  useGetVaultsWithdrawal,
  useRefreshAssetsBalance,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { useWithdrawVault } from "@/hooks/use-withdraw-vault";
import { formatPercentage } from "@/lib/utils";
import { showFormatNumber } from "@/lib/number";
import { DepositVaultConfig } from "@/types/vault-config.types";
import { calculateUserHoldings } from "@/utils/helpers";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VaultItem } from "./vault-item";
import useBreakpoint from "@/hooks/use-breakpoint";
import ConditionRenderer from "@/components/shared/condition-renderer";
import VaultItemMobile from "./vault-item-mobile";
import VaultHolding from "./vault-holding";
import VaultRewards from "./vault-rewards";
import { Skeleton } from "@/components/ui/skeleton";
import UserHoldingTooltip from "./user-holding-tooltip";

const OPTIONS_CHAINS = [
  { value: "all", label: "All Chains" },
  {
    value: "sui",
    label: "SUI",
    icon: <img src="/chains/sui.png" alt="SUI" className="w-5 h-5" />,
  },
  {
    value: "bsc",
    label: "BSC",
    disabled: true,
    icon: <img src="/chains/bsc.png" alt="BSC" className="w-5 h-5" />,
    left: (
      <div
        className="text-white text-[10px] px-2"
        style={{
          borderRadius: "90px",
          border: "0.5px solid #FFE8C9",
        }}
      >
        Coming Soon
      </div>
    ),
  },
];

type TokenPool = {
  name: string;
  image: string;
};

type Withdrawing = {
  receive_amount_usd: string;
  countdown: number;
  is_ready: boolean;
};

export type VaultItemData = DepositVaultConfig & {
  exchange_name: string;
  exchange_image: string;
  exchange_code: string;
  token_pools: TokenPool[];
  user_holdings: number;
  user_holdings_show?: string | number;
  total_value_usd_show?: string | number;
  rewards_24h_usd_show?: string | number;
  vault_apy_show?: string | number;
  rewards_earned_show?: string;
  is_loading_withdrawal: boolean;
  withdrawing: Withdrawing | null;
};

export default function VaultList() {
  const { isLoading, data = [] } = useGetDepositVaults();
  const {
    isLoading: isLoadingWithdrawal,
    data: dataWithdrawals = [],
    refetch: refetchVaultsWithdrawal,
  } = useGetVaultsWithdrawal();
  const { redeemWithVaultId } = useWithdrawVault();
  const navigate = useNavigate();
  const { vaultObjects } = useVaultObjectStore();
  const { assets: ndlpAssets } = useNdlpAssetsStore();
  const { refreshAllBalance } = useRefreshAssetsBalance();
  const { isMd } = useBreakpoint();

  const [dex, setDex] = useState<string[]>(["all"]);
  const [chains, setChains] = useState<string[]>(["all"]);
  const [search, setSearch] = useState<string>("");
  const [idLoadingClaim, setIdLoadingClaim] = useState("");
  const [idsClaimed, setIdsClaimed] = useState<string[]>([]);
  const [paramsSort, setParamsSort] = useState({
    vault_apy: SORT_TYPE.desc,
    // total_value_usd: SORT_TYPE.desc,
    // rewards_24h_usd: SORT_TYPE.desc,
    // user_holdings: SORT_TYPE.desc,
    keySort: "vault_apy",
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const showUsd = (num, emty = "--") => {
    return num ? showFormatNumber(num, 2, 2, "$") : emty;
  };

  const mapData = useMemo(() => {
    return data.map((vault) => {
      const ndlpBalance =
        ndlpAssets.find((asset) => asset.coin_type === vault.vault_lp_token)
          ?.balance || "0";
      const user_holdings = Number(
        calculateUserHoldings(
          ndlpBalance,
          vault?.user_pending_withdraw_ndlp,
          vault?.vault_lp_token_decimals,
          vault?.ndlp_price_usd
        )
      );
      const vault_apy = Number(vault?.vault_apy || 0);

      // Be resilient to unknown/new exchanges coming from API
      const fallbackExchange = {
        code: "unknown",
        name: `Exchange ${vault?.exchange_id ?? ""}`.trim(),
        image: "/dexs/cetus.png",
      };
      const exchange = EXCHANGE_CODES_MAP[vault?.exchange_id] || fallbackExchange;

      // Guard against missing pool or pool_name from API. Normalize separators.
      const poolName = vault?.pool?.pool_name || "";
      const normalizedPoolName = poolName.replace(/\//g, "-");
      const tokens = normalizedPoolName ? normalizedPoolName.split("-") : [];

      const withdrawal_vault = dataWithdrawals?.find(
        (i) => vault.vault_id === i.vault_id
      );
      let withdrawal = null;
      if (
        withdrawal_vault &&
        withdrawal_vault.withdrawals?.length &&
        !idsClaimed.includes(vault.vault_id)
      ) {
        const tmp = withdrawal_vault.withdrawals[0];
        withdrawal = {
          receive_amount_usd: showUsd(tmp?.receive_amount_usd),
          countdown: tmp?.countdown,
          is_ready: !!tmp?.is_ready,
        } as any;
      }

      return {
        ...vault,
        exchange_name: exchange.name,
        exchange_image: exchange.image,
        exchange_code: exchange.code,
        user_holdings: user_holdings,
        token_pools: tokens.map((i) => {
          return { name: i, image: `/coins/${i?.toLowerCase()}.png` };
        }),

        user_holdings_show: showUsd(user_holdings),
        total_value_usd_show: showUsd(vault?.total_value_usd),
        rewards_24h_usd_show: showUsd(vault?.rewards_24h_usd),
        vault_apy_show: vault?.vault_apy
          ? formatPercentage(vault_apy < 0 ? 0 : vault_apy)
          : "--",
        rewards_earned_show: !Number(user_holdings)
          ? "--"
          : "+" + showUsd(withdrawal_vault?.user_reward_earned_usd || "0"),
        is_loading_withdrawal: isLoadingWithdrawal,
        withdrawing: withdrawal,
      } as VaultItemData;
    });
  }, [data, ndlpAssets, isLoadingWithdrawal, dataWithdrawals, idsClaimed]);

  // Filter logic: if 'all' is selected, show all; else filter by selected DEXs
  const filteredData = useMemo(
    () =>
      mapData.filter((vault) => {
        return (
          (!search ||
            vault.vault_name.toLowerCase().includes(search.toLowerCase()) ||
            vault.exchange_name.toLowerCase().includes(search.toLowerCase())) &&
          (dex.includes("all") || dex.includes(vault.exchange_id?.toString()))
        );
      }),
    [search, dex, mapData]
  );

  const sortedData = useMemo(() => {
    return filteredData.sort((a, b) => {
      const av = Number((a as any)[paramsSort.keySort] ?? 0);
      const bv = Number((b as any)[paramsSort.keySort] ?? 0);
      if (paramsSort[paramsSort.keySort] === SORT_TYPE.asc) {
        return av - bv;
      }
      return bv - av;
    });
  }, [filteredData, paramsSort]);

  const dexOptions = useMemo(() => {
    return Array.from(new Set(data.map((vault) => vault?.exchange_id)));
  }, [data]);

  const handleRowClick = useCallback(
    (el: any) => {
      navigate(`/vault/${el.vault_id}`);
    },
    [navigate]
  );

  const onClaim = useCallback(
    async (data: any) => {
      setIdLoadingClaim(data.vault_id);
      const res = await redeemWithVaultId(data.vault_id);
      if (res) {
        setIdsClaimed([...idsClaimed, data.vault_id]);
        setTimeout(() => {
          refreshAllBalance();
        }, 2000);
      }
      setIdLoadingClaim("");
    },
    [redeemWithVaultId, refreshAllBalance, idsClaimed]
  );

  const columns = useMemo(
    () => [
      {
        title: (
          <LabelWithTooltip
            hasIcon={false}
            label="AI Vaults"
            labelClassName="text-white/80 text-left text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
            tooltipContent="Trading pair and DEX name"
          />
        ),
        dataIndex: "vault_name",
        classCell: "py-6",
        classTitle: "text-white/80 text-left",
        render: (_, record: VaultItemData) => <VaultItem item={record} />,
      },
      {
        title: (
          <LabelWithTooltip
            hasIcon={false}
            label="TVL"
            labelClassName="text-white/80 text-left text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
            tooltipContent={
              <div className="text-xs">
                Total USD value of all vault assets. Updates live.{" "}
                <span className="text-[#FFBD24] font-bold text-xs">
                  {" "}
                  (USD equivalent)
                </span>
              </div>
            }
          />
        ),
        dataIndex: "tvl",
        keySort: "total_value_usd",
        render: (value: any, record: any) => (
          <span className="text-white font-medium font-mono text-base">
            {record.total_value_usd_show}
          </span>
        ),
      },
      {
        title: (
          <LabelWithTooltip
            hasIcon={false}
            label="APY"
            labelClassName="text-white/80 text-left text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
            tooltipContent="Your real yearly return with hourly compounding, based on the average APR of the last 7 days. Updates every 1 hour."
          />
        ),
        dataIndex: "apy",
        classTitle: "text-white/80 text-left",
        keySort: "vault_apy",
        render: (value: any, record: any) => (
          <span className="text-green-increase font-medium font-mono text-base break-all">
            {record.vault_apy_show}
          </span>
        ),
      },
      {
        title: (
          <LabelWithTooltip
            hasIcon={false}
            label="24h Rewards"
            labelClassName="text-white/80 text-left text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
            tooltipContent={
              <div className="text-xs">
                Total LP fees and token incentives earned by the vault in the
                last 24 hours
                <span className="text-[#FFBD24] font-bold text-xs">
                  {" "}
                  (USD equivalent)
                </span>
                . Updates every 1 hour.
              </div>
            }
          />
        ),
        dataIndex: "rewards",
        classTitle: "text-white/80 text-left w-[100px]",
        keySort: "rewards_24h_usd",
        render: (value: any, record: any) => (
          <span className="text-white font-medium font-mono text-base">
            {record.rewards_24h_usd_show}
          </span>
        ),
      },
      {
        title: (
          <LabelWithTooltip
            hasIcon={false}
            label="Your Holdings"
            labelClassName="text-white/80 text-left text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
            tooltipContent={
              <div className="text-xs">
                The total value of your position in the vault, including both
                principal and accrued rewards
                <span className="text-[#FFBD24] font-bold text-xs">
                  {" "}
                  (USD equivalent)
                </span>
                . Updates every 1 hour.
              </div>
            }
          />
        ),
        dataIndex: "holdings",
        classTitle: "text-white/80 w-[110px]",
        keySort: "user_holdings",
        render: (_: any, record: any) => (
          <UserHoldingTooltip>
            <div>
              <div className="text-white font-medium font-mono text-base">
                {record.user_holdings_show}
              </div>
              {record.is_loading_withdrawal ? (
                <Skeleton className="w-[80px] h-5 mt-1" />
              ) : (
                <div className="text-green-increase font-medium font-mono text-sm mt-1">
                  {record.rewards_earned_show}
                </div>
              )}
            </div>
          </UserHoldingTooltip>
        ),
      },
      {
        title: (
          <LabelWithTooltip
            hasIcon={false}
            label="Rewards"
            labelClassName="text-white/80 text-left text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
            tooltipContent="Total rewards earned in this vault are automatically compounded into your liquidity and updated every hour."
          />
        ),
        dataIndex: "rewards",
        classTitle: "text-white/80 justify-start",
        classCell: "justify-start",
        render: (_: any, record: any) => {
          return <VaultRewards item={record} />;
        },
      },
      {
        title: "Action",
        dataIndex: "action",
        classTitle: "justify-end",
        render: (_: any, record: any) => (
          <Web3Button
            onClick={() => handleRowClick(record)}
            className="w-[86px] ml-auto"
          >
            Deposit
          </Web3Button>
        ),
      },
    ],
    [handleRowClick]
  );

  const rowsColspan = useMemo(
    () => [
      {
        dataIndex: "withdrawing",
        className: "!p-0",
        checkHidden: (record: any) => {
          return record?.withdrawing == null;
        },
        render: (value: any, record: any) => (
          <div
            className={cn(
              "px-6 py-1.5 flex item-center justify-end",
              value?.is_ready === true
                ? "bg-green-increase/20"
                : "bg-amber-600/20"
            )}
          >
            <VaultHolding
              item={record}
              isOnlyWithdrawing={true}
              reloadData={refetchVaultsWithdrawal}
            />

            <ButtonGradient
              onClick={(e: React.FormEvent) => {
                e.stopPropagation();
                e.preventDefault();
                onClaim(record);
              }}
              variant="outline"
              className="w-[86px] ml-[52px]"
              classButtonInner={
                value?.is_ready === true
                  ? "bg-green-increase/20"
                  : "bg-amber-600/20"
              }
              loading={idLoadingClaim === record.vault_id}
              disabled={!!idLoadingClaim || value?.is_ready !== true}
              hideContentOnLoading={true}
            >
              Claim
            </ButtonGradient>
          </div>
        ),
      },
    ],
    [refetchVaultsWithdrawal, onClaim, idLoadingClaim]
  );

  const handleSort = useCallback(
    async (key) => {
      const _params = { ...paramsSort, keySort: key };
      _params[key] =
        _params[key] == SORT_TYPE.desc ? SORT_TYPE.asc : SORT_TYPE.desc;
      setParamsSort(_params);
    },
    [paramsSort]
  );

  const optionDexs = useMemo(() => {
    return [
      { value: "all", label: "All DEXs" },
      ...dexOptions.map((item) => {
        const ex = EXCHANGE_CODES_MAP[item] || {
          name: `Exchange ${item}`,
          image: "/dexs/cetus.png",
        };
        return {
          value: item?.toString?.() ?? String(item),
          label: ex.name,
          icon: (
            <img src={ex.image} alt={ex.name} className="w-5 h-5" />
          ),
        };
      }),
    ];
  }, [dexOptions]);

  useEffect(() => {
    const hasClaim = mapData.find((i) => i?.withdrawing?.is_ready === false);

    if (hasClaim) {
      intervalRef.current = setInterval(() => {
        refetchVaultsWithdrawal();
      }, 30000); // 30s
    }

    if (!hasClaim && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  return (
    <div className="w-full mx-auto max-md:p-4 max-md:rounded-lg max-md:pt-6 max-md:bg-[#121212]">
      {isMd && (
        <div
          className="text-white font-sans text-[22px] font-bold leading-normal tracking-[-1.2px] mb-6"
          style={{ fontFamily: '"DM Sans"' }}
        >
          Live Vaults
        </div>
      )}
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-center md:justify-between rounded-t-md",
          isMd ? "gap-4 bg-[#292929] px-6 py-4" : "gap-4"
        )}
      >
        <div className="w-full md:w-80 md:max-w-1/2">
          <InputSearch
            className="bg-black text-white placeholder:text-white/60 w-full rounded-lg px-4 py-2 border border-white/20 pl-9 focus-visible:ring-1 focus-visible:ring-white/70"
            placeholder="Search AI vaults..."
            onChange={(value) => setSearch(value)}
            debounceTime={300}
          />
        </div>
        <div className="flex gap-3">
          <GradientSelect
            options={OPTIONS_CHAINS}
            placeholder="All Chains"
            value={chains}
            onChange={setChains}
          />
          <GradientSelect
            options={optionDexs}
            placeholder="All DEXs"
            value={dex}
            onChange={setDex}
          />
        </div>
      </div>
      <ConditionRenderer
        when={isMd}
        fallback={
          <div className="pt-6">
            <ConditionRenderer
              when={sortedData?.length > 0}
              fallback={
                <ConditionRenderer
                  when={isLoading}
                  fallback={
                    <div className="flex flex-col gap-4">
                      <p className="text-white text-center text-sm">
                        No vaults found
                      </p>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[270px] bg-white/10 animate-pulse rounded w-full"
                      />
                    ))}
                  </div>
                </ConditionRenderer>
              }
            >
              {sortedData.map((item) => (
                <VaultItemMobile
                  key={item.vault_id}
                  item={item}
                  idLoadingClaim={idLoadingClaim}
                  reloadDataWithdraw={refetchVaultsWithdrawal}
                  onRowClick={handleRowClick}
                  onClaim={onClaim}
                />
              ))}
            </ConditionRenderer>
          </div>
        }
      >
        <div className="rounded-md overflow-hidden bg-[#181818] border border-t-0 rounded-t-none border-[rgba(255, 255, 255, 0.20)]">
          <TableRender
            headerClassName="p-4 h-[70px] border-b"
            data={sortedData}
            columns={columns}
            rowsColspan={rowsColspan}
            isLoading={isLoading}
            labelNodata="No vaults found"
            paramsSearch={paramsSort}
            changeSort={handleSort}
            onRowClick={handleRowClick}
          />
        </div>
      </ConditionRenderer>
    </div>
  );
}
