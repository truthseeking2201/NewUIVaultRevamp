import http from "@/utils/http";

const URLS = {
  tokenPrices: `/data-management/external/vaults/token-prices`,
  ndlpPrices: `/data-management/external/vaults/ndlp-prices`,
};

export const getTokenPrices = (payload: number[]) => {
  return http.post(URLS.tokenPrices, {
    token_ids: payload,
  });
};

export const getNdlpPrices = (payload: string[]) => {
  return http.post(URLS.ndlpPrices, {
    vault_addresses: payload,
  });
};
