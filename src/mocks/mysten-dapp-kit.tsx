import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SuiClient } from "./sui-client";

type Account = { address: string } | null;

const WalletCtx = createContext<{
  account: Account;
  setAccount: (a: Account) => void;
}>({ account: { address: "0xFAKEDEADBEEF" }, setAccount: () => {} });

export const WalletProvider: React.FC<any> = ({ children }) => {
  const [account, setAccount] = useState<Account>({ address: "0xFAKEDEADBEEF" });
  const value = useMemo(() => ({ account, setAccount }), [account]);
  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>;
};

export const SuiClientProvider: React.FC<any> = ({ children }) => <>{children}</>;

export const createNetworkConfig = (_: any) => ({ networkConfig: {} });

export function useCurrentAccount() {
  const { account } = useContext(WalletCtx);
  return account;
}

export function useCurrentWallet() {
  return { currentWallet: { name: "MockWallet" } } as any;
}

export function useDisconnectWallet() {
  const { setAccount } = useContext(WalletCtx);
  return {
    mutateAsync: async () => setAccount(null),
  } as any;
}

export function useConnectWallet() {
  const { setAccount } = useContext(WalletCtx);
  const connectImpl = (opts?: any, callbacks?: { onSuccess?: (data: any) => void; onError?: (err: any) => void }) => {
    try {
      // Use a valid-looking hex address to avoid downstream parsers choking
      const addr = "0x" + "a".repeat(64);
      setAccount({ address: addr });
      // persist connection info so hooks relying on localStorage can read it
      try {
        localStorage.setItem(
          "sui-dapp-kit:wallet-connection-info",
          JSON.stringify({ state: { lastConnectedAccountAddress: addr } })
        );
      } catch {}
      // simulate dapp-kit shape for onSuccess
      const payload = { accounts: [{ address: addr }] };
      callbacks?.onSuccess?.(payload);
      return payload;
    } catch (e) {
      callbacks?.onError?.(e);
      throw e;
    }
  };

  return {
    isPending: false,
    mutate: (opts?: any, callbacks?: any) => connectImpl(opts, callbacks),
    mutateAsync: async (opts?: any, callbacks?: any) => connectImpl(opts, callbacks),
  } as any;
}

export function useWallets() {
  // Pretend all popular wallets are installed so the UI's list works unchanged.
  const wallets = [
    { name: "Slush" },
    { name: "Phantom" },
    { name: "Newmoney" },
    { name: "Suiet" },
    { name: "Backpack" },
    { name: "Binance Wallet" },
    { name: "OKX Wallet" },
    { name: "Gate Wallet" },
    { name: "Bitget Wallet" },
  ];
  // Return a plain array, only append a marker flag. Do NOT override find/map.
  return Object.assign(wallets, { isLoading: false }) as any;
}

export function useSignPersonalMessage() {
  return {
    // Return base64 strings to be compatible with any consumer that expects base64
    mutateAsync: async (_: any) => ({
      bytes: "V2VsY29tZSB0byBOT0RPIEFJIFZhdWx0cw==",
      signature: "TU9DS19TSUdOQVRVUkU=",
    }),
  } as any;
}

export function useSignAndExecuteTransaction() {
  return {
    isPending: false,
    mutateAsync: async (_: any) => ({ digest: "0xMOCKDIGEST", effects: {} }),
  } as any;
}

// Client hooks
export function useSuiClient() {
  const [client] = useState(() => new SuiClient());
  return client as any;
}

// Very light imitation of useSuiClientQuery used in hooks
export function useSuiClientQuery(methodName: string, args: any, opts?: { enabled?: boolean }) {
  const client = useSuiClient() as any;
  const [data, setData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const enabled = opts?.enabled !== false;

  useEffect(() => {
    let active = true;
    async function run() {
      if (!enabled) return;
      setIsLoading(true);
      try {
        const fn = client?.[methodName];
        const res = typeof fn === "function" ? await fn.call(client, args) : null;
        if (active) setData(res);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [methodName, JSON.stringify(args), enabled]);

  return {
    data,
    isLoading,
    isFetching: isLoading,
    refetch: async () => {
      const fn = client?.[methodName];
      const res = typeof fn === "function" ? await fn.call(client, args) : null;
      setData(res);
      return res;
    },
  } as any;
}
