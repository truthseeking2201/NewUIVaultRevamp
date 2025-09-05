export type WalletDetails = {
  email: string | null;
  status: string;
  wallet_provider: string;
  wallet_address: string;
  timestamp: string;
  metadata: string | null;
  invite_code?: any;
  total_referrals?: number;
};
