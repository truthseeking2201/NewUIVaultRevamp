import { useCurrentAccount } from "@mysten/dapp-kit";
import { isValidSuiAddress, normalizeSuiAddress } from "@mysten/sui/utils";
import { useMemo } from "react";
import { create } from "zustand";
interface WalletState {
  isConnectWalletDialogOpen: boolean;
  isAuthenticated: boolean;
  setIsConnectWalletDialogOpen: (isConnectWalletDialogOpen: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const useWalletStore = create<WalletState>((set) => ({
  isConnectWalletDialogOpen: false,
  isAuthenticated: false,
  setIsConnectWalletDialogOpen: (isConnectWalletDialogOpen: boolean) =>
    set({ isConnectWalletDialogOpen }),
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
}));

export const useWallet = () => {
  const account = useCurrentAccount();
  const walletConnectionInfo = JSON.parse(
    localStorage.getItem("sui-dapp-kit:wallet-connection-info") || "{}"
  );
  const lastConnectedAccountAddress =
    walletConnectionInfo?.state?.lastConnectedAccountAddress;

  // Validate address to avoid passing invalid values to Sui client/backend
  const isMockMode = (import.meta as any)?.env?.VITE_MOCK_MODE === "true";
  let address: string | undefined =
    account?.address || lastConnectedAccountAddress;
  if (address) {
    try {
      const normalized = normalizeSuiAddress(address);
      if (!isValidSuiAddress(normalized)) {
        address = undefined;
      } else {
        address = normalized;
      }
    } catch (_) {
      address = undefined;
    }
  }
  // In mock mode, ensure a valid-looking connected address so UI flows work
  if (!address && isMockMode) {
    address = ("0x" + "a".repeat(64)) as string;
  }
  const {
    isConnectWalletDialogOpen,
    setIsConnectWalletDialogOpen,
    isAuthenticated,
    setIsAuthenticated,
  } = useWalletStore((state) => state);

  const calculateIsAuthenticated = useMemo(() => {
    if (isMockMode) return true;
    if (isAuthenticated) return true;
    const access_token = localStorage.getItem("access_token");
    return !!access_token && !!address;
  }, [address, isAuthenticated, isMockMode]);

  return {
    isConnected: !!address,
    isConnectWalletDialogOpen,
    openConnectWalletDialog: () => setIsConnectWalletDialogOpen(true),
    closeConnectWalletDialog: () => setIsConnectWalletDialogOpen(false),
    setIsAuthenticated,
    isAuthenticated: calculateIsAuthenticated,
    address,
  };
};
