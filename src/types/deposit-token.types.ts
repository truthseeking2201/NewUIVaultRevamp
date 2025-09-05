export type DepositToken = {
  symbol: string;
  decimals: number;
  balance: string;
  token_address: string;
  balance_usd?: string;
  usd_price?: string;
};

export type EstimateDualDepositToken = {
  estimated_ndlp: string;
  amount_a: string;
  amount_b: string;
  ndlp_rate: number;
  ndlp_per_deposit_rate: number;
  collateral_amount: string;
  tick_lower: number;
  tick_upper: number;
};
