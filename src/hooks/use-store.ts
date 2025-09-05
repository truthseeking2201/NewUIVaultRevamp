import { NdlpAsset, UserCoinAsset } from "@/types/coin.types";
import { SCVaultConfig } from "@/types/vault-config.types";
import { create } from "zustand";
import { createJSONStorage, devtools } from "zustand/middleware";
import { useVaultBasicDetails } from "./use-vault";
import { LP_TOKEN_CONFIG } from "@/config";
import { persist } from "zustand/middleware";

interface DepositVaultState {
  depositVault: string | null;
  setDepositVault: (depositVault: string) => void;
}

const depositVaultStore = create<DepositVaultState>((set) => ({
  depositVault: null,
  setDepositVault: (vaultId: string) => set({ depositVault: vaultId }),
}));

export const useDepositVaultStore = () => {
  const depositVault = depositVaultStore((state) => state.depositVault);
  const setDepositVault = depositVaultStore((state) => state.setDepositVault);
  return {
    depositVault,
    setDepositVault,
  };
};

type WhiteListModalState = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const whiteListModalStore = create<WhiteListModalState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));

export const useWhiteListModalStore = () => {
  const isOpen = whiteListModalStore((state) => state.isOpen);
  const setIsOpen = whiteListModalStore((state) => state.setIsOpen);
  return {
    isOpen,
    setIsOpen,
  };
};

interface UserAssetsState {
  assets: UserCoinAsset[];
  updated: boolean;
  isRefetch: boolean;
  isLoading: boolean;
  updatedAt: number;
  setAssets: (assets: UserCoinAsset[]) => void;
  setRefetch: () => void;
  setUpdated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
}

interface NdlpAssetsState {
  assets: NdlpAsset[];
  updated: boolean;
  isRefetch: boolean;
  isLoading: boolean;
  updatedAt: number;
  setAssets: (assets: UserCoinAsset[]) => void;
  setRefetch: () => void;
  setUpdated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
}

const userAssetsStore = create<UserAssetsState>()(
  persist(
    (set) => ({
      assets: [],
      updated: false,
      isRefetch: false,
      isLoading: true,
      updatedAt: 0,
      setRefetch: () => set({ isRefetch: true }),
      setUpdated: (value: boolean) => set({ updated: value }),
      setAssets: (assets: UserCoinAsset[]) => {
        set({
          assets,
          isRefetch: false,
          isLoading: false,
          updated: true,
          updatedAt: Date.now(),
        });
      },
      setDefaultAssets: (assets: UserCoinAsset[]) => set({ assets }),
      setIsLoading: (value: boolean) => set({ isLoading: value }),
    }),
    {
      name: "user-assets",
      partialize: (state) => ({
        assets: state.assets,
        updatedAt: state.updatedAt,
      }),
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

const ndlpAssetsStore = create<NdlpAssetsState>()(
  persist(
    (set) => ({
      assets: [],
      updated: false,
      isRefetch: false,
      isLoading: true,
      updatedAt: 0,
      setRefetch: () => set({ isRefetch: true }),
      setUpdated: (value: boolean) => set({ updated: value }),
      setAssets: (assets: NdlpAsset[]) => {
        set({
          assets,
          isRefetch: false,
          isLoading: false,
          updated: true,
          updatedAt: Date.now(),
        });
      },
      setDefaultAssets: (assets: NdlpAsset[]) => set({ assets }),
      setIsLoading: (value: boolean) => set({ isLoading: value }),
    }),
    {
      name: "ndlp-assets",
      partialize: (state) => ({
        assets: state.assets,
        updatedAt: state.updatedAt,
      }),
      version: 2,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface VaultObjectConfigState {
  vaultObjects: SCVaultConfig[];
  setVaultObjects: (vaults: SCVaultConfig[]) => void;
}

const vaultObjectStore = create<VaultObjectConfigState>()((set) => ({
  vaultObjects: [],
  setVaultObjects: (vaults: SCVaultConfig[]) => set({ vaultObjects: vaults }),
}));

export const useVaultObjectStore = () => {
  const vaultObjects = vaultObjectStore((state) => state.vaultObjects);
  const setVaultObjects = vaultObjectStore((state) => state.setVaultObjects);
  return { vaultObjects, setVaultObjects };
};

export const useUserAssetsStore = () => {
  const assets = userAssetsStore((state) => state.assets);
  const setAssets = userAssetsStore((state) => state.setAssets);
  const updated = userAssetsStore((state) => state.updated);
  const isRefetch = userAssetsStore((state) => state.isRefetch);
  const isLoading = userAssetsStore((state) => state.isLoading);
  const setRefetch = userAssetsStore((state) => state.setRefetch);
  const setUpdated = userAssetsStore((state) => state.setUpdated);
  const setIsLoading = userAssetsStore((state) => state.setIsLoading);

  return {
    assets,
    updated,
    setAssets,
    isRefetch,
    setRefetch,
    isLoading,
    setUpdated,
    setIsLoading,
  };
};

export const useNdlpAssetsStore = () => {
  const assets = ndlpAssetsStore((state) => state.assets);
  const setAssets = ndlpAssetsStore((state) => state.setAssets);
  const updated = ndlpAssetsStore((state) => state.updated);
  const isRefetch = ndlpAssetsStore((state) => state.isRefetch);
  const isLoading = ndlpAssetsStore((state) => state.isLoading);
  const setRefetch = ndlpAssetsStore((state) => state.setRefetch);
  const setUpdated = ndlpAssetsStore((state) => state.setUpdated);
  const setIsLoading = ndlpAssetsStore((state) => state.setIsLoading);

  return {
    assets,
    updated,
    setAssets,
    isRefetch,
    setRefetch,
    isLoading,
    setUpdated,
    setIsLoading,
  };
};

export const useGetCoinByType = (coinType: string) => {
  const assets = userAssetsStore((state) => state.assets);
  return assets.find((asset) => asset.coin_type === coinType);
};

export const useGetLpToken = (coinType: string, vaultId: string) => {
  const assets = ndlpAssetsStore((state) => state.assets);
  const asset = assets.find((asset) => asset.coin_type === coinType);
  const { data: vaultDetails } = useVaultBasicDetails(vaultId);
  const isMockMode = (import.meta as any)?.env?.VITE_MOCK_MODE === "true";

  if (asset) {
    // Force a large balance in mock mode for demo flows
    return isMockMode ? { ...asset, balance: "1000000" } : asset;
  }

  // if asset is not found, check if it is a lp token in vault details
  if (vaultDetails) {
    const token = vaultDetails?.tokens?.find(
      (token) => token.token_address === coinType
    );

    return {
      ...token,
      ...LP_TOKEN_CONFIG,
      balance: isMockMode ? "1000000" : "0",
      usd_price: "0",
      decimals: vaultDetails?.vault_lp_token_decimals,
    };
  }
  return {
    ...LP_TOKEN_CONFIG,
    balance: isMockMode ? "1000000" : "0",
    usd_price: "0",
  };
};
