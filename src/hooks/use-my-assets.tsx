import {
  COIN_TYPES_CONFIG,
  LP_TOKEN_CONFIG,
  SUI_CONFIG,
  USDC_CONFIG,
} from "@/config/coin-config";
import { REFETCH_VAULT_DATA_INTERVAL } from "@/config/constants";
import { getBalanceAmountForInput } from "@/lib/number";
import { roundDownBalance } from "@/lib/utils";
import { NdlpAsset, UserCoinAsset } from "@/types/coin.types";
import { DepositVaultConfig } from "@/types/vault-config.types";
import { useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { CoinMetadata, SuiClient } from "@mysten/sui/client";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useMemo } from "react";
import { useNdlpAssetsStore, useUserAssetsStore } from "./use-store";
import { useCurrentDepositVault } from "./use-vault";
import { useWallet } from "./use-wallet";
import { NdlpTokenPrice } from "./use-token-price";
import { getNdlpPrices } from "@/apis/token";
import { getDepositTokens } from "@/apis";
import { VaultDepositToken } from "@/types/payment-token.types";

const getCoinObjects = async (
  suiClient: SuiClient,
  coinType: string,
  address: string
) => {
  let allCoins = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    // Get a page of coins with optional cursor
    const coinsPage = await suiClient.getCoins({
      owner: address,
      cursor: cursor,
      coinType: coinType,
      limit: 50, // Number of items per page (default is 50)
    });

    // Add coins from this page to our collection
    allCoins = [...allCoins, ...coinsPage.data];

    // Update the cursor for the next page
    cursor = coinsPage.nextCursor;

    // Check if there are more pages
    hasNextPage = coinsPage.hasNextPage;
  }
  return allCoins;
};

const getAllCoinObjects = async (suiClient: SuiClient, address: string) => {
  let allCoins = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    // Get a page of coins with optional cursor
    const coinsPage = await suiClient.getAllCoins({
      owner: address,
      cursor: cursor,
      limit: 50, // Number of items per page (default is 50)
    });

    // Add coins from this page to our collection
    allCoins = [...allCoins, ...coinsPage.data];

    // Update the cursor for the next page
    cursor = coinsPage.nextCursor;

    // Check if there are more pages
    hasNextPage = coinsPage.hasNextPage;
  }
  return allCoins.map((c) => {
    return {
      ...c,
      // map to full 32-byte address representation for sui coin type
      coinType:
        c.coinType === SUI_CONFIG.shortType ? SUI_CONFIG.coinType : c.coinType,
    };
  });
};

const getCoinsBalance = async (
  suiClient: SuiClient,
  address: string,
  coinTypes: string[]
) => {
  const allBalances = await suiClient.getAllBalances({ owner: address });
  const data = coinTypes.map((coinType) => {
    const _coinType =
      coinType == SUI_CONFIG.coinType ? SUI_CONFIG.shortType : coinType;
    return {
      coinType,
      totalBalance:
        allBalances.find((i) => i.coinType == _coinType)?.totalBalance || "0",
    };
  });
  return data;

  // const balances = await Promise.all(
  //   coinTypes.map((coinType) =>
  //     suiClient.getBalance({ owner: address, coinType })
  //   )
  // );
  // return balances.map((balance) => {
  //   return {
  //     coinType:
  //       balance.coinType == SUI_CONFIG.shortType
  //         ? SUI_CONFIG.coinType
  //         : balance.coinType,
  //     totalBalance: balance.totalBalance,
  //   };
  // });
};

const getCoinsBalanceWithUsdPrice = async (
  suiClient: SuiClient,
  address: string,
  coinTypes: string[],
  vaults: DepositVaultConfig[]
) => {
  const vaultIds = vaults.map((vault) => vault.vault_id) || [];
  const [balancesResult, ndlpPricesResult] = await Promise.allSettled([
    // Promise.all(
    //   coinTypes.map((coinType) =>
    //     suiClient.getBalance({ owner: address, coinType })
    //   )
    // ),
    getCoinsBalance(suiClient, address, coinTypes),
    getNdlpPrices(vaultIds),
  ]);

  const balances =
    balancesResult.status === "fulfilled" ? balancesResult.value : [];

  let ndlpPrices: NdlpTokenPrice[] = [];
  if (ndlpPricesResult.status === "fulfilled") {
    ndlpPrices = ndlpPricesResult.value as unknown as NdlpTokenPrice[];
  } else {
    console.error("Fail to get ndlp prices", ndlpPricesResult.reason);
  }

  return balances.map((balance) => {
    const matchVault = vaults.find(
      (vault) => vault.vault_lp_token === balance.coinType
    );
    const usdPrice = ndlpPrices.find(
      (price) => price.vault_id === matchVault?.vault_id
    )?.ndlp_price_usd;

    return {
      coinType:
        balance.coinType == SUI_CONFIG.shortType
          ? SUI_CONFIG.coinType
          : balance.coinType,
      totalBalance: balance.totalBalance,
      usd_price: usdPrice,
      vault: {
        pool: {
          pool_name: matchVault?.pool.pool_name,
        },
        exchange_id: matchVault?.exchange_id,
        vault_name: matchVault?.vault_name,
        vault_id: matchVault?.vault_id,
      },
    };
  });
};

export const useMyAssets = () => {
  const { address: currentAddress, isAuthenticated } = useWallet();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  const currentVault = useCurrentDepositVault();

  // Clear cache when account address becomes empty
  useEffect(() => {
    if (!currentAddress) {
      queryClient.removeQueries({ queryKey: ["lpCoinObjects"] });
      queryClient.removeQueries({ queryKey: ["collateralCoinObjects"] });
    }
  }, [currentAddress, queryClient]);

  const {
    data: lpCoinObjects,
    isLoading: lpCoinObjectsLoading,
    refetch: lpCoinObjectsRefetch,
  } = useQuery({
    queryKey: ["lpCoinObjects", currentAddress, currentVault.vault_id],
    queryFn: () =>
      getCoinObjects(
        suiClient,
        currentVault.vault_lp_token,
        currentAddress || ""
      ),
    enabled: isAuthenticated,
    staleTime: REFETCH_VAULT_DATA_INTERVAL,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
  });

  const {
    data: collateralCoinObjects,
    isLoading: collateralCoinObjectsLoading,
    refetch: collateralCoinObjectsRefetch,
  } = useQuery({
    queryKey: ["collateralCoinObjects", currentAddress],
    queryFn: () =>
      getCoinObjects(
        suiClient,
        currentVault.collateral_token,
        currentAddress || ""
      ),
    enabled: isAuthenticated,
    staleTime: REFETCH_VAULT_DATA_INTERVAL,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
  });

  const refreshBalance = useCallback(() => {
    lpCoinObjectsRefetch();
    collateralCoinObjectsRefetch();
  }, [lpCoinObjectsRefetch, collateralCoinObjectsRefetch]);

  const coinMetadata = useGetCoinsMetadata();
  const coinObjects = useMemo(() => {
    let res = [];
    if (lpCoinObjects && lpCoinObjects.length > 0) {
      res = [...res, ...lpCoinObjects];
    } else {
      res = [
        ...res,
        {
          coinType: currentVault.vault_lp_token,
          balance: 0,
        },
      ];
    }

    if (collateralCoinObjects && collateralCoinObjects.length > 0) {
      res = [...res, ...collateralCoinObjects];
    } else {
      res = [
        ...res,
        {
          coinType: currentVault.collateral_token,
          balance: 0,
        },
      ];
    }

    return res;
  }, [
    lpCoinObjects,
    collateralCoinObjects,
    currentVault.vault_lp_token,
    currentVault.collateral_token,
  ]);

  const assets: UserCoinAsset[] =
    coinObjects.reduce((acc, coin) => {
      const metadata = coinMetadata[coin.coinType] as CoinMetadata;
      const decimals = metadata?.decimals || 9;
      const rawBalance = Number(coin.balance || "0");
      const balance = rawBalance / Math.pow(10, decimals);

      const collateralToken = COIN_TYPES_CONFIG.collateral_tokens.find(
        (token) => token.id === coin.coinType
      );

      const existingAsset = acc.find(
        (asset) => asset.coin_type === coin.coinType
      );
      if (existingAsset) {
        existingAsset.balance += balance;
        existingAsset.raw_balance += rawBalance;
      } else {
        acc.push({
          coin_type: coin.coinType,
          balance,
          raw_balance: rawBalance,
          image_url: collateralToken
            ? collateralToken.image_url
            : LP_TOKEN_CONFIG.image_url,
          decimals: decimals,
          display_name: collateralToken
            ? collateralToken.display_name
            : LP_TOKEN_CONFIG.display_name,
          name: metadata?.name,
          symbol: metadata?.symbol,
        });
      }
      return acc;
    }, []) || [];

  return {
    assets: assets.map((asset) => ({
      ...asset,
      balance: getBalanceAmountForInput(
        asset.raw_balance,
        asset.decimals,
        asset.decimals
      ),
    })),
    isLoading: lpCoinObjectsLoading || collateralCoinObjectsLoading,
    refreshBalance,
  };
};

export const useGetCoinsMetadata = () => {
  const suiClient = useSuiClient();
  const currentVault = useCurrentDepositVault();

  const allowedCoinTypes = useMemo(() => {
    return [currentVault?.vault_lp_token, currentVault.collateral_token];
  }, [currentVault]);

  const coinsMetadata = useQueries({
    queries: allowedCoinTypes.map((coinType) => ({
      queryKey: ["getCoinMetadata", coinType],
      queryFn: () => suiClient.getCoinMetadata({ coinType }),
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
    })),
  });

  const coinMetadata = coinsMetadata.reduce((acc, result, index) => {
    if (result.data) {
      acc[allowedCoinTypes[index]] = result.data;
    }
    return acc;
  }, {} as Record<string, CoinMetadata>);

  return coinMetadata;
};

export const useGetCoinBalance = (coinType: string, decimals: number) => {
  const { address: currentAddress, isAuthenticated } = useWallet();

  const { data: allCoins, refetch } = useSuiClientQuery(
    "getCoins",
    {
      owner: currentAddress,
      coinType,
    },
    {
      enabled: isAuthenticated && !!coinType,
    }
  );

  // Calculate the user's LP token balance
  const userLPBalance = useMemo(() => {
    if (!allCoins?.data) return 0;

    const totalBalance = allCoins.data.reduce((sum, coin) => {
      return sum + parseInt(coin.balance || "0") / Math.pow(10, decimals);
    }, 0);

    return totalBalance;
  }, [allCoins, decimals]);

  return { balance: roundDownBalance(userLPBalance, 2), refetch };
};

export const useGetVaultTokenPair = () => {
  const { assets } = useMyAssets();
  const depositVault = useCurrentDepositVault();

  const collateralToken = useMemo(
    () =>
      assets.find((asset) => asset.coin_type === depositVault.collateral_token),
    [assets, depositVault.collateral_token]
  );

  const lpToken = useMemo(
    () =>
      assets.find((asset) => asset.coin_type === depositVault.vault_lp_token),
    [assets, depositVault.vault_lp_token]
  );

  return { collateralToken, lpToken };
};

export const useFetchAssets = () => {
  const { setAssets, setUpdated, updated, isRefetch, isLoading, setIsLoading } =
    useUserAssetsStore();
  const { address, isAuthenticated } = useWallet();
  const suiClient = useSuiClient();

  const { data: depositTokens, refetch: refetchDepositTokens } = useQuery<
    VaultDepositToken[]
  >({
    queryKey: ["depositTokens"],
    queryFn: async () => {
      const response =
        (await getDepositTokens()) as unknown as VaultDepositToken[];
      const uniqueTokensResponse = response.filter(
        (token, index, self) =>
          index ===
          self.findIndex((t) => t.token_address === token.token_address)
      );
      if (uniqueTokensResponse?.length > 0) {
        localStorage.setItem(
          "cached-deposit-tokens",
          JSON.stringify(uniqueTokensResponse)
        );
      }
      return uniqueTokensResponse;
    },
    initialData: JSON.parse(
      localStorage.getItem("cached-deposit-tokens") || "[]"
    ) as VaultDepositToken[],
  });

  const {
    data: allCoinObjects = [],
    isLoading: allCoinObjectsLoading,
    isFetching: allCoinObjectsFetching,
    refetch: allCoinObjectsRefetch,
  } = useQuery({
    queryKey: ["allCoinObjects", address],
    queryFn: () =>
      getCoinsBalance(
        suiClient,
        address || "",
        depositTokens?.map((token) => token.token_address)
      ),
    enabled: isAuthenticated && !!address && depositTokens?.length > 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const isFetching = allCoinObjectsFetching || allCoinObjectsLoading;
    if (isFetching) return;

    if (allCoinObjects.length === 0 && isLoading) {
      setIsLoading(false);
      return;
    }

    if (updated) {
      return;
    }

    // map assets from allCoinObjects
    const assets: UserCoinAsset[] =
      allCoinObjects.reduce((acc, coin) => {
        const coinType = coin.coinType;
        const coinMetadata = depositTokens?.find(
          (token) => token.token_address === coinType
        );
        const decimals = coinMetadata?.decimal;

        const tokenDisplay = COIN_TYPES_CONFIG.collateral_tokens.find(
          (token) => token.id === coinType
        );

        acc.push({
          coin_type: coinType,
          balance: "0",
          raw_balance: coin.totalBalance,
          image_url:
            tokenDisplay?.image_url ||
            `/coins/${coinMetadata?.token_symbol}.png`,
          decimals: decimals,
          display_name:
            tokenDisplay?.display_name || coinMetadata?.token_name || "",
          name: tokenDisplay?.display_name || coinMetadata?.token_name || "",
          symbol: coinMetadata?.token_symbol || "",
        });
        return acc;
      }, []) || [];

    if (assets.length > 0) {
      const updatedAssets = assets.map((asset) => {
        const balance = getBalanceAmountForInput(
          asset.raw_balance,
          asset.decimals,
          asset.decimals
        ).toString();
        return {
          ...asset,
          raw_balance: new BigNumber(asset.raw_balance).toString(),
          balance: balance,
        };
      });

      setAssets(updatedAssets);
    }
  }, [
    allCoinObjects,
    updated,
    depositTokens,
    setAssets,
    allCoinObjectsLoading,
    allCoinObjectsFetching,
    isLoading,
    setIsLoading,
  ]);

  useEffect(() => {
    if (isRefetch) {
      refetchDepositTokens();
      allCoinObjectsRefetch().then(() => {
        setUpdated(false);
      });
    }
  }, [isRefetch, allCoinObjectsRefetch, refetchDepositTokens, setUpdated]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuthenticated) {
      interval = setInterval(() => {
        allCoinObjectsRefetch().then(() => {
          setUpdated(false);
        });
      }, REFETCH_VAULT_DATA_INTERVAL);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [allCoinObjectsRefetch, isAuthenticated, setUpdated]);
};

export const useFetchNDLPAssets = (vaults: DepositVaultConfig[]) => {
  const { setAssets, setUpdated, updated, isRefetch, isLoading, setIsLoading } =
    useNdlpAssetsStore();
  const { address, isAuthenticated } = useWallet();
  const suiClient = useSuiClient();
  const ndlpCoinTypes = useMemo(() => {
    return vaults?.map((vault) => vault.vault_lp_token) || [];
  }, [vaults]);

  const {
    data: allCoinObjectsNDLP = [],
    isLoading: allCoinObjectsNDLPLoading,
    isFetching: allCoinObjectsNDLPFetching,
    refetch: allCoinObjectsNDLPRefetch,
  } = useQuery({
    queryKey: ["allCoinObjectsNDLP", address],
    queryFn: () =>
      getCoinsBalanceWithUsdPrice(
        suiClient,
        address || "",
        ndlpCoinTypes,
        vaults
      ),
    enabled: isAuthenticated && !!address && ndlpCoinTypes.length > 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const isFetching = allCoinObjectsNDLPFetching || allCoinObjectsNDLPLoading;
    if (isFetching) return;

    if (allCoinObjectsNDLP.length === 0 && isLoading) {
      setIsLoading(false);
      return;
    }

    if (updated) {
      return;
    }

    const assets: NdlpAsset[] =
      allCoinObjectsNDLP.reduce((acc, coin) => {
        const coinType = coin.coinType;
        const vault = vaults.find((i) => i.vault_lp_token === coinType);
        const tokenDisplay = LP_TOKEN_CONFIG;

        acc.push({
          coin_type: coinType,
          balance: "0",
          raw_balance: coin.totalBalance,
          image_url: tokenDisplay?.image_url || "",
          decimals: vault.vault_lp_token_decimals,
          display_name: tokenDisplay?.display_name || "",
          name: tokenDisplay?.display_name || "",
          symbol: tokenDisplay?.symbol || "",
          vault: coin.vault || null,
          usd_price: coin.usd_price,
        });
        return acc;
      }, []) || [];

    if (assets.length > 0) {
      const updatedAssets = assets.map((asset) => {
        const balance = getBalanceAmountForInput(
          asset.raw_balance,
          asset.decimals,
          asset.decimals
        ).toString();
        return {
          ...asset,
          raw_balance: new BigNumber(asset.raw_balance).toString(),
          balance: balance,
          balance_usd: asset.usd_price
            ? new BigNumber(balance)
                .multipliedBy(new BigNumber(asset.usd_price))
                .toString()
            : "",
        };
      });

      setAssets(updatedAssets);
    }
  }, [
    allCoinObjectsNDLP,
    updated,
    setAssets,
    allCoinObjectsNDLPFetching,
    allCoinObjectsNDLPLoading,
    isLoading,
    vaults,
    setIsLoading,
  ]);

  useEffect(() => {
    if (isRefetch) {
      allCoinObjectsNDLPRefetch().then(() => {
        setUpdated(false);
      });
    }
  }, [isRefetch, allCoinObjectsNDLPRefetch, setUpdated]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuthenticated) {
      interval = setInterval(() => {
        allCoinObjectsNDLPRefetch().then(() => {
          setUpdated(false);
        });
      }, REFETCH_VAULT_DATA_INTERVAL);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [allCoinObjectsNDLPRefetch, isAuthenticated, setUpdated]);
};

export const useRefreshAssetsBalance = () => {
  const { setRefetch: setUserRefetch } = useUserAssetsStore();
  const { setRefetch: setNdlpRefetch } = useNdlpAssetsStore();

  const refreshAllBalance = useCallback(() => {
    setUserRefetch();
    setNdlpRefetch();
  }, [setUserRefetch, setNdlpRefetch]);

  return { refreshAllBalance };
};
