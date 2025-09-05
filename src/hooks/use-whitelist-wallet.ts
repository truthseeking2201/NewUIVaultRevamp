import { subscribeWhitelistRequest } from "@/apis";
import { WalletDetails } from "@/types/wallet-detail";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWallet } from "./use-wallet";

export const useWhitelistWallet = () => {
  const { address: currentAddress, isAuthenticated } = useWallet();
  const { currentWallet } = useCurrentWallet();
  const walletAddress = currentAddress;
  const walletProvider = currentWallet?.name;

  const {
    data: walletDetails,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["walletDetails", walletAddress, walletProvider],
    queryFn: () => subscribeWhitelistRequest(walletAddress, walletProvider),
    enabled: !!walletAddress && !!walletProvider && isAuthenticated,
    refetchOnWindowFocus: false,
  }) as UseQueryResult<WalletDetails>;

  const wlServer =
    walletDetails?.status === "APPROVED" ||
    walletDetails?.status === "SIGNED_UP";

  const cachedWhitelistedAddress = localStorage.getItem("whitelisted_address");

  const isWhitelisted = wlServer || cachedWhitelistedAddress === walletAddress;

  useEffect(() => {
    if (wlServer && walletAddress) {
      localStorage.setItem("whitelisted_address", walletAddress);
    }
  }, [wlServer, walletAddress]);

  useEffect(() => {
    if (cachedWhitelistedAddress && !wlServer && walletAddress) {
      localStorage.removeItem("whitelisted_address");
      refetch();
    }
  }, [
    cachedWhitelistedAddress,
    wlServer,
    walletAddress,
    refetch,
    isAuthenticated,
  ]);

  return {
    isWhitelisted,
    isLoading,
    walletDetails,
    refetch,
  };
};
