export interface VaultData {
  id: string;
  name: string;
  type: "nova" | "orion" | "emerald";
  tvl: number;
  apr: number;
  apy: number;
  description: string;
  lockupPeriods: LockupPeriod[];
  riskLevel: "low" | "medium" | "high";
  strategy: string;
  performance: PerformanceData;
}

export interface LockupPeriod {
  days: number;
  aprBoost: number;
}

export interface PerformanceData {
  daily: { date: string; value: number }[];
  weekly: { date: string; value: number }[];
  monthly: { date: string; value: number }[];
}

export interface UserInvestment {
  vaultId: string;
  principal: number;
  shares: number;
  depositDate: string;
  lockupPeriod: number;
  unlockDate: string;
  currentValue: number;
  profit: number;
  isWithdrawable: boolean;
  currentApr?: number; // Added currentApr property as optional
}

export interface TransactionHistory {
  list?: Transaction[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface Transaction {
  type:
    | "ADD_LIQUIDITY"
    | "REMOVE_LIQUIDITY"
    | "CLAIM_REWARDS"
    | "SWAP"
    | "ADD_PROFIT_UPDATE_RATE"
    | "OPEN"
    | "CLOSE"
    | "ALL";
  time: string;
  vault_address: string;
  tokens: Token[];
  txhash: string;
  status: string;
  id: string;
  value: string;
  reason?: string;
}

export interface Token {
  token_id: number;
  token_name: string;
  token_symbol: string;
  token_address: string;
  decimal: number;
  amount: number;
  price: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export type Types = {
  type:
    | "ADD_LIQUIDITY"
    | "REMOVE_LIQUIDITY"
    | "CLAIM_REWARDS"
    | "SWAP"
    | "ADD_PROFIT_UPDATE_RATE"
    | "OPEN"
    | "CLOSE"
    | "ALL";
};
