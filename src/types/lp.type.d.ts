export interface TokenType {
  token_name?: string;
  token_symbol: string;
  token_address: string;
  decimal: number;
  image: string;
  amount?: number;
}

export default interface LpType {
  vault_config_id: string;
  vault_id: string;
  package_id: string;
  clock?: string;
  vault_name?: string;

  lp_coin_type: string;
  lp_symbol?: string;
  lp_decimals: number | 9;
  lp_image?: string;
  is_token_only?: boolean;

  collateral_coin_type: string;
  collateral_symbol?: string;
  collateral_decimals?: number | 9;
  collateral_image?: string;

  token_coin_type?: string;
  token_symbol?: string;
  token_decimals?: number | 9;
  token_image?: string;

  quote_coin_type?: string;
  quote_symbol?: string;
  quote_decimals?: number | 9;
  quote_image?: string;

  receive_tokens?: TokenType[];
  is_enable_dual_token?: boolean;
}
