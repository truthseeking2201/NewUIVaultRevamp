import {
  DepositVaultConfig,
  WithdrawalRequests,
} from "@/types/vault-config.types";
import http from "@/utils/http";

const URLS = {
  latestWithdrawal: `/data-management/external/withdrawals/latest`,
  executionWithdrawals: "/data-management/external/withdrawals",
  executionProfitData: (vault_id: string) =>
    `/data-management/external/vaults/${vault_id}/profit-data?lock_data=true`,
  withdrawalRequestsByUser:
    "/data-management/external/withdrawal-requests/by-user",
  withdrawalRequestsMultiTokens:
    "/data-management/external/withdrawal-requests/multi-tokens",
  positionRequests: (
    page: number,
    limit: number,
    action_type?: string,
    vault_id?: string,
    time_range?: string
  ) => {
    let url = `/data-management/external/position-requests?page=${page}&limit=${limit}&vault_id=${vault_id}`;
    if (action_type && action_type !== "") url += `&action_type=${action_type}`;
    if (time_range && time_range !== "") url += `&time_range=${time_range}`;
    return url;
  },
  depositVaults: (accountAddress?: string) => {
    let url = `/data-management/external/vaults/list`;
    if (accountAddress && accountAddress !== "default") {
      url += `?wallet_address=${accountAddress}`;
    }
    return url;
  },
  vaultsWithdrawal: (accountAddress?: string) => {
    let url = `/data-management/external/vaults/withdrawals`;
    if (accountAddress && accountAddress !== "default") {
      url += `?wallet_address=${accountAddress}`;
    }
    return url;
  },
  vaultAnalytics: (vaultId: string, type: string, range: string) =>
    `/data-management/external/vaults/${vaultId}/histogram?histogram_type=${type}&histogram_range=${range}`,
  vaultBasicDetails: (vaultId: string, walletAddress: string) => {
    let url = `/data-management/external/vaults/${vaultId}/basic`;
    if (walletAddress && walletAddress !== "default") {
      url += `?wallet_address=${walletAddress}`;
    }
    return url;
  },
  estimateWithdraw: (
    vaultId: string,
    ndlp_amount: string,
    payout_token: string
  ) =>
    `/data-management/external/vaults/${vaultId}/estimate-withdraw?ndlp_amount=${ndlp_amount}&payout_token=${payout_token}`,
  getEstimateWithdrawDual: (vaultId: string, ndlp_amount: string) =>
    `/data-management/external/vaults/${vaultId}/estimate-withdraw-dual?ndlp_amount=${ndlp_amount}`,
  estimateDeposit: (vaultId: string, amount: string, deposit_token: string) =>
    `/data-management/external/vaults/${vaultId}/estimate-deposit?amount=${amount}&deposit_token=${deposit_token}`,
  swapDepositInfo: (vaultId: string, token_address: string) =>
    `/data-management/external/vaults/${vaultId}/swap-and-deposit-info?token_address=${token_address}`,
  checkCanDeposit: (vaultId: string, token_address: string, amount: string) =>
    `/data-management/external/vaults/${vaultId}/check-deposit?deposit_token=${token_address}&deposit_amount=${amount}`,
  userHolding: (vaultId: string, ndlp_balance: string) =>
    `/data-management/external/user/vault-stats?vault_id=${vaultId}&ndlp_balance=${ndlp_balance}`,
  estimateDualDeposit: (vaultId: string) =>
    `/data-management/external/vaults/${vaultId}/estimate-deposit-dual`,
  depositTokens: `/data-management/external/vaults/list-deposit-tokens`,
  lpBreakdown: (vaultId: string) => `/data-management/external/vaults/${vaultId}/lp-breakdown`,
};

export const getLatestWithdrawal = (sender_address: string) => {
  return http.get(URLS.latestWithdrawal);
};

export const executionWithdrawal = (payload: any) => {
  return http.post(URLS.executionWithdrawals, payload);
};

export const executionProfitData = (vault_id: string) => {
  return http.get(URLS.executionProfitData(vault_id));
};

export const getSignatureRedeem = (params: any) => {
  return http.get(URLS.withdrawalRequestsByUser, {
    params,
  });
};

export const getWithdrawalRequestsMultiTokens = (params: any) => {
  return http.get(URLS.withdrawalRequestsMultiTokens, {
    params,
  });
};

export const getVaultsActivities = (payload: any) => {
  const { page, limit, action_type, vault_id, time_range } = payload;
  return http.get(
    URLS.positionRequests(page, limit, action_type, vault_id, time_range)
  );
};

export const getDepositVaults = (accountAddress?: string) => {
  return http.get(URLS.depositVaults(accountAddress)) as Promise<
    DepositVaultConfig[]
  >;
};

export const getVaultsWithdrawal = (accountAddress?: string) => {
  return http.get(URLS.vaultsWithdrawal(accountAddress)) as Promise<
    WithdrawalRequests[]
  >;
};

export const getVaultAnalytics = (
  vaultId: string,
  type: string,
  range: string
) => {
  return http.get(URLS.vaultAnalytics(vaultId, type, range));
};

export const getVaultBasicDetails = (
  vaultId: string,
  walletAddress: string
) => {
  return http.get(URLS.vaultBasicDetails(vaultId, walletAddress));
};

export const getEstimateWithdraw = (
  vaultId: string,
  params: { ndlp_amount: string; payout_token: string }
) => {
  return http.get(
    URLS.estimateWithdraw(vaultId, params.ndlp_amount, params.payout_token)
  );
};

export const getEstimateWithdrawDual = (
  vaultId: string,
  ndlp_amount: string
) => {
  return http.get(URLS.getEstimateWithdrawDual(vaultId, ndlp_amount));
};

export const getEstimateDeposit = (
  vaultId: string,
  params: { amount: string; deposit_token: string }
) => {
  return http.get(
    URLS.estimateDeposit(
      vaultId,
      params.amount,
      encodeURIComponent(params.deposit_token)
    )
  );
};

export const getSwapDepositInfo = (vaultId: string, token_address: string) => {
  return http.get(
    URLS.swapDepositInfo(vaultId, encodeURIComponent(token_address))
  );
};

export const checkCanDeposit = (
  vaultId: string,
  token_address: string,
  amount: string
) => {
  return http.get(
    URLS.checkCanDeposit(vaultId, token_address, amount)
  ) as Promise<{
    can_deposit: boolean;
  }>;
};

export const getUserHolding = (vaultId: string, ndlp_balance: string) => {
  return http.get(URLS.userHolding(vaultId, ndlp_balance));
};

export const getEstimateDualDeposit = (vaultId: string) => {
  return http.get(URLS.estimateDualDeposit(vaultId));
};

export const getDepositTokens = () => {
  return http.get(URLS.depositTokens);
};

export const getLpBreakdown = (vaultId: string) => {
  return http.get(URLS.lpBreakdown(vaultId));
};
