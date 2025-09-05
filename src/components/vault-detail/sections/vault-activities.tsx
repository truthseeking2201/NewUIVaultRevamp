import { useCallback } from "react";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACTIVITIES_TABS, ACTIVITIES_TIME_TABS } from "@/components/vault-detail/constant";
import { useState, useEffect } from "react";
import { TransactionHistory, Types, Transaction } from "@/types/vault";
import { getVaultsActivities } from "@/apis/vault";
import { useQuery } from "@tanstack/react-query";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import {
  ITEMS_PER_PAGE,
  ADD_LIQUIDITY_TYPES,
  REMOVE_LIQUIDITY_TYPES,
  SWAP_TYPES,
} from "@/components/vault-detail/constant";
import MobileList from "@/components/vault-detail/activities/mobile";
import DesktopTable from "@/components/vault-detail/activities/desktop";
import ActivitiesInsights from "@/components/vault-detail/activities/insights";

interface VaultActivitiesProps {
  isDetailLoading: boolean;
  vault_id: string;
}

const VaultActivities = ({
  isDetailLoading,
  vault_id,
}: VaultActivitiesProps) => {
  const [filter, setFilter] = useState<Types["type"][]>(["ALL"]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastTotalPages, setLastTotalPages] = useState(1);

  const fetchVaultActivities = useCallback(
    async ({
      page = 1,
      limit = 5,
      action_type = "",
      vault_id = "",
    }: {
      page?: number;
      limit?: number;
      action_type?: string;
      vault_id?: string;
      time_range?: string;
    }): Promise<TransactionHistory> => {
      try {
        const response = await getVaultsActivities({
          page,
          limit,
          action_type,
          vault_id,
        });

        if (response) {
          return response as TransactionHistory;
        }
      } catch (error) {
        console.error("Error fetching vault activities:", error);
      }
      return { list: [], total: 0, page: 1 } as TransactionHistory;
    },
    []
  );

  // Using React Query and set up pagination
  const { data, isFetching, isFetched } = useQuery({
    queryKey: ["activities", vault_id, currentPage, filter, timeRange],
    queryFn: () =>
      fetchVaultActivities({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        action_type: handleFormatFilter(filter),
        time_range: timeRange,
        vault_id,
      }),
    staleTime: 30000,
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    keepPreviousData: true,
  });

  const listItems = data?.list ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const handleFormatFilter = useCallback((filter: Types["type"][]) => {
    if (filter.includes("ALL")) {
      return "";
    }
    if (filter.some((type) => SWAP_TYPES.includes(type))) {
      return "SWAP";
    }
    if (filter.some((type) => ADD_LIQUIDITY_TYPES.includes(type))) {
      return "ADD_LIQUIDITY";
    }
    if (filter.some((type) => REMOVE_LIQUIDITY_TYPES.includes(type))) {
      return "REMOVE_LIQUIDITY";
    }
    if (filter.includes("OPEN")) {
      return "OPEN";
    }
    if (filter.includes("CLOSE")) {
      return "CLOSE";
    }
    return "";
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [setCurrentPage, totalPages]
  );

  const handleFilterChange = useCallback(
    (newFilter: Types["type"][]) => {
      if (
        newFilter.length !== filter.length ||
        !newFilter.every((f, i) => f === filter[i])
      ) {
        setCurrentPage(1);
        setFilter(newFilter);
        fetchVaultActivities({
          page: 1,
          limit: ITEMS_PER_PAGE,
          action_type: handleFormatFilter(newFilter),
        });
      }
    },
    [fetchVaultActivities, handleFormatFilter, filter]
  );

  const handleSelectTransaction = useCallback((transaction: Transaction) => {
    if (transaction.txhash) {
      window.open(
        `https://suiscan.xyz/mainnet/tx/${transaction.txhash}`,
        "_blank"
      );
    }
  }, []);

  useEffect(() => {
    if (!isFetching && totalPages !== lastTotalPages) {
      setLastTotalPages(totalPages);
    }
  }, [isFetching, totalPages, lastTotalPages]);

  const displayTotalPages = isFetching ? lastTotalPages : totalPages;
  const paginatedTransactions = listItems;

  const { isMobile } = useBreakpoint();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const handleToggleExpand = useCallback((tx: Transaction) => {
    setExpandedId((prev) => (prev === tx.id ? null : tx.id));
  }, []);

  return (
    <DetailWrapper
      title="Vault Activities"
      titleComponent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <Tabs
            value={filter[0]}
            onValueChange={(value) =>
              handleFilterChange([value as Types["type"]])
            }
          >
            <TabsList className="p-1 flex gap-1 overflow-x-auto no-scrollbar max-w-full">
              {ACTIVITIES_TABS.map((tab, index) => (
                <TabsTrigger key={`tab-${index}`} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tabs
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as '24h' | '7d' | '30d')}
          >
            <TabsList className="p-1 flex gap-1 overflow-x-auto no-scrollbar max-w-full">
              {ACTIVITIES_TIME_TABS.map((tab, index) => (
                <TabsTrigger key={`time-${index}`} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      }
      isLoading={isDetailLoading}
      loadingStyle="h-[447px] w-full"
    >
      {/* AI Insights: subtle summary of recent activity */}
      <ActivitiesInsights
        vault_id={vault_id}
        timeRange={timeRange as any}
        filter={filter}
        onQuickFilter={(key) => {
          const map: Record<string, Types["type"]> = {
            inflow: "ADD_LIQUIDITY",
            outflow: "REMOVE_LIQUIDITY",
            net: "ALL",
            swaps: "SWAP",
            stoploss: "REMOVE_LIQUIDITY",
            churn: "OPEN",
          };
          const t = map[key] || "ALL";
          handleFilterChange([t]);
          try {
            const url = new URL(window.location.href);
            url.searchParams.set('insightFilter', key);
            window.history.replaceState({}, '', `${url.pathname}${url.search}`);
            // Scroll table into view
            const el = document.querySelector('[data-activities-root]') as HTMLElement | null;
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch {}
        }}
        onChangeRange={(r) => setTimeRange(r as any)}
      />
      <div data-activities-root />
      {isMobile ? (
        <MobileList
          paginatedTransactions={paginatedTransactions}
          isFetched={isFetched}
          handleSelectTransaction={handleSelectTransaction}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
        />
      ) : (
        <DesktopTable
          paginatedTransactions={paginatedTransactions}
          isFetching={isFetching}
          isFetched={isFetched}
          handleSelectTransaction={handleSelectTransaction}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
        />
      )}

      <CustomPagination
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={totalItems}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
        displayTotalPages={displayTotalPages}
        isShowingTotalPages={true}
      />
    </DetailWrapper>
  );
};

export default VaultActivities;
