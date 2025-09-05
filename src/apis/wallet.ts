import http from "@/utils/http";

const URLS = {
  walletDetails: "/data-management/external/user/wallet-detail",
  subscribe: "/data-management/external/user/subscribe",
  updateWalletProvider: "/data-management/external/user/update-wallet-provider",
  confirmUserExists: "/data-management/external/user/apply-referral",
  checkReferralCode: (referralCode: string) =>
    `/data-management/external/user/check-referral/${referralCode}`,
  linkReferralCode: `/data-management/external/user/invite-code`,
  skipReferralCode: `/data-management/external/user/skip-invite-code`,
  myAffiliateDashboard: `/data-management/external/user/my-affiliate-dashboard`,
};

export const subscribeWhitelistRequest = async (
  walletAddress: string,
  walletProvider: string
) => {
  const res = (await http.get(URLS.walletDetails)) as any;

  if (res?.data === null) {
    await http.post(URLS.subscribe, {
      wallet_address: walletAddress,
      wallet_provider: walletProvider,
    });
    return await http.get(URLS.walletDetails);
  }
  if (!res?.wallet_provider && walletProvider) {
    http.post(URLS.updateWalletProvider, {
      wallet_address: walletAddress,
      wallet_provider: walletProvider,
    });
  }
  return res;
};

export const getMyReferral = (params: any) => {
  return http.get(URLS.myAffiliateDashboard, {
    params: params,
  });
};

export const getWalletDetail = async (walletAddress: string) => {
  const res = (await http.get(`${URLS.walletDetails}`)) as any;

  return res;
};

export const confirmUserExists = async ({ wallet_address }) => {
  const res = (await http.post(`${URLS.confirmUserExists}`, {
    wallet_address,
  })) as any;

  return res;
};

export const checkReferralCode = async (referralCode: string) => {
  const res = (await http.get(URLS.checkReferralCode(referralCode))) as any;

  return res;
};

export const linkReferralCode = async ({
  invite_code,
}: {
  invite_code: string;
}) => {
  const res = (await http.post(URLS.linkReferralCode, {
    invite_code,
  })) as any;

  return res;
};

export const skipReferralCode = async () => {
  const res = (await http.post(URLS.skipReferralCode)) as any;

  return res;
};
