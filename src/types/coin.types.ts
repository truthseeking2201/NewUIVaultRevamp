import { DepositVaultConfig } from "./vault-config.types";

export interface UserCoinAsset {
  coin_type: string;
  balance: string;
  balance_string: string;
  raw_balance: string;
  image_url: string;
  decimals: number;
  display_name: string;
  name: string;
  symbol: string;
}

export interface NdlpAsset extends UserCoinAsset {
  balance_usd?: string;
  usd_price?: string;
  vault: {
    pool: {
      pool_name: string;
    };
    exchange_id: string;
    vault_name: string;
    vault_id: string;
  };
}
