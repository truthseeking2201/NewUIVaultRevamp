import { isMobileDevice } from "@/utils/helpers";

const STEPS = {
  CONNECT_WALLET: "connect_wallet",
  INPUT_REFERRAL: "input_referral",
  REFERRAL_SUCCESS: "referral_success",
  EXISTING_USER_CONFIRM: "existing_user_confirm",
  REFERRAL_CONFIRM: "referral_confirm",
};

const CASES = {
  NEW_USER_WITHOUT_REFERRAL: "new_user_without_referral",
  NEW_USER_WITH_REFERRAL: "new_user_with_referral",
  EXISTING_USER: "existing_user",
};

const WALLETS = [
  {
    displayName: "Slush",
    name: "Slush",
    icon: "/wallets/slush-wallet.png",
    extensionUrl: "https://slush.app/download",
  },
  {
    displayName: "Phantom",
    name: "Phantom",
    icon: "/wallets/phantom-wallet.png",
    extensionUrl: "https://phantom.app/download",
  },
  {
    displayName: "Newmoney",
    name: "Newmoney",
    icon: "/wallets/newmoney-wallet.png",
    extensionUrl:
      "https://chromewebstore.google.com/detail/newmoneyai/coknkdplmddfgoggddpienehfhdgegna?pli=1",
  },
  {
    displayName: "Suiet",
    name: "Suiet",
    icon: "/wallets/suiet-wallet.png",
    extensionUrl: "https://chromewebstore.google.com/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd",
  },
  {
    displayName: "Backpack",
    name: "Backpack",
    icon: "/wallets/backpack-wallet.png",
    extensionUrl: "https://chromewebstore.google.com/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof",
  },
  {
    displayName: "Binance",
    name: "Binance Wallet",
    icon: "/wallets/binance-wallet.png",
    extensionUrl: "https://www.binance.com/en/binancewallet",
  },
  {
    displayName: "OKX",
    name: "OKX Wallet",
    icon: "/wallets/okx-wallet.png",
    extensionUrl: "https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge",
  },
  {
    displayName: "Gate",
    name: "Gate Wallet",
    icon: "/wallets/gate-wallet.png",
    extensionUrl: "https://chromewebstore.google.com/detail/gate-wallet/cpmkedoipcpimgecpmgpldfpohjplkpp?hl=en",
  },
  {
    displayName: "Bitget",
    name: "Bitget Wallet",
    icon: "/wallets/bitget-wallet.png",
    extensionUrl: "https://chromewebstore.google.com/detail/bitget-wallet-crypto-web3/jiidiaalihmmhddjgbnbgdfflelocpak",
  },
];

const WALLET_STATUS = {
  NEW: "NEW",
  PROCESSING: "PROCESSING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SIGNED_UP: "SIGNED_UP",
};

export { STEPS, CASES, WALLETS, WALLET_STATUS };
