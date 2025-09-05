import { VaultPaymentToken } from "./vault-config.types";

export default interface PaymentTokenType extends VaultPaymentToken {
  image: string;
}

export type VaultDepositToken = {
  token_id: number;
  token_symbol: string;
  token_name: string;
  token_address: string;
  decimal: number;
};
