import { useEffect } from "react";
import { useConnectWallet } from "@mysten/dapp-kit";

export function useMockAutoConnect() {
  const { mutate } = useConnectWallet();
  useEffect(() => {
    const isMock = import.meta.env.VITE_MOCK_MODE === "true";
    if (!isMock) return;

    // Seed auth tokens and wallet info so the app treats user as authenticated.
    localStorage.setItem("access_token", "mock_access_token");
    localStorage.setItem("refresh_token", "mock_refresh_token");
    localStorage.setItem("last_wallet", "Phantom");
    localStorage.setItem(
      "sui-dapp-kit:wallet-connection-info",
      JSON.stringify({ state: { lastConnectedAccountAddress: "0x" + "a".repeat(64) } })
    );

    // Trigger a mock wallet connect so all hooks behave as if connected.
    try {
      mutate({ wallet: { name: "Phantom" } } as any);
    } catch (_) {}
  }, [mutate]);
}
