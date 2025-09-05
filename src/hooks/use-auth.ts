import { loginWallet } from "@/apis/auth";
import { triggerWalletDisconnect } from "@/utils/wallet-disconnect";
import { useSignPersonalMessage } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import { useWallet } from "./use-wallet";
import { useNdlpAssetsStore, useUserAssetsStore } from "./use-store";
import { useGetDepositVaults } from "./use-vault";
import * as Sentry from "@sentry/react";
import { normalizeSuiAddress } from "@mysten/sui/utils";

function normalizeB64(input: string) {
  if (!input) return input;
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4 !== 0) s += "=";
  return s;
}

export const useLoginWallet = () => {
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const { mutateAsync: triggerLoginWallet } = useMutation({
    mutationFn: loginWallet,
  });

  const { refetch: refetchDepositVaults } = useGetDepositVaults();

  const { setUpdated } = useUserAssetsStore();
  const { setUpdated: setNdlpUpdated } = useNdlpAssetsStore();

  const { setIsAuthenticated } = useWallet();

  return async (walletAddress: string) => {
    try {
      // In mock mode, bypass signing/backend and seed tokens directly.
      if (import.meta.env.VITE_MOCK_MODE === "true") {
        localStorage.setItem("access_token", "mock_access_token");
        localStorage.setItem("refresh_token", "mock_refresh_token");
        setIsAuthenticated(true);
        Sentry.setUser({ wallet_address: walletAddress });
        setUpdated(false);
        setNdlpUpdated(false);
        refetchDepositVaults();
        return { success: true };
      }

      const timestamp = Date.now();
      const message = new TextEncoder().encode(
        `Welcome to NODO AI Vaults. ${new Date(timestamp).toUTCString()}`
      );
      const signResult = await signPersonalMessage({
        message,
      });

      const addressNormalized = (() => {
        try {
          return normalizeSuiAddress(walletAddress);
        } catch {
          return walletAddress;
        }
      })();

      const payload = {
        signature: normalizeB64(signResult.signature),
        // Base64 message bytes; normalize padding and URL-safe alphabet
        bytes: normalizeB64(signResult.bytes as unknown as string),
        timestamp,
        address: addressNormalized,
      } as any;

      if (import.meta.env.MODE !== "production") {
        // minimal debug to aid backend interop issues
        // do not log full signature to avoid leaking; log shapes only
        // eslint-disable-next-line no-console
        console.debug("login payload", {
          address: payload.address,
          timestamp: payload.timestamp,
          sigLen: payload.signature?.length,
          bytesLen: payload.bytes?.length,
        });
      }

      const data = await triggerLoginWallet(payload);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setIsAuthenticated(true);
      Sentry.setUser({
        wallet_address: walletAddress,
      });
      setUpdated(false);
      setNdlpUpdated(false);
      refetchDepositVaults();
      return {
        success: true,
      };
    } catch (error) {
      console.log(error);
      Sentry.captureException(error, {
        extra: {
          walletAddress,
        },
      });
      triggerWalletDisconnect();
      return {
        success: false,
        message: error?.response?.data?.message || error?.message,
      };
    }
  };
};
