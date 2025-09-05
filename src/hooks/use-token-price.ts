import { useQuery } from "@tanstack/react-query";
import { getTokenPrices } from "@/apis/token";
import { REFETCH_VAULT_DATA_INTERVAL } from "@/config/constants";
import { AxiosResponse } from "axios";
import { useMemo } from "react";

export type NdlpTokenPrice = {
  vault_id: string;
  ndlp_price: string;
  ndlp_price_usd: string;
};

export type TokenUsdPrice = {
  token_id: number;
  price: number;
};

export const useTokenPrices = (tokenIds: number[]) => {
  const query = useQuery({
    queryKey: ["tokenPrices", tokenIds],
    queryFn: () => getTokenPrices(tokenIds),
    enabled: tokenIds.length > 0,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
    staleTime: REFETCH_VAULT_DATA_INTERVAL,
  }) as unknown as AxiosResponse<TokenUsdPrice[]>;

  const data = useMemo(() => {
    return query?.data?.reduce((acc, curr) => {
      acc[curr.token_id] = curr.price;
      return acc;
    }, {});
  }, [query?.data]);

  return {
    ...query,
    data,
  };
};
