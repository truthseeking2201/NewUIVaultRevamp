import { MainLayout } from "@/components/layout/main-layout";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  createNetworkConfig,
  SuiClientProvider,
  useDisconnectWallet,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GlobalLoading from "./components/shared/global-loading";
import ScrollToTop from "./components/ui/scroll-to-top";
import {
  useCriticalImagePrefetch,
  useFetchAssets,
  useFetchNDLPAssets,
  useGetAllVaults,
  useGetDepositVaults,
  useNdlpAssetsStore,
  useUserAssetsStore,
  useWallet,
} from "./hooks";
import Home from "./pages/home";
import VaultDetail from "./pages/vault-detail";
import { setWalletDisconnectHandler } from "./utils/wallet-disconnect";
import { isMobileDevice } from "./utils/helpers";
import { useToast } from "./hooks/use-toast";
import { IconErrorToast } from "./components/ui/icon-error-toast";
import { useStableAutoConnect } from "./hooks/use-stable-auto-connect";
import { useMockAutoConnect } from "./hooks/use-mock-auto-connect";

const NotFound = lazy(() =>
  import("./pages/not-found").catch((e) => {
    console.error("Error loading NotFound:", e);
    return { default: () => <GlobalLoading /> };
  })
);

const useSetWalletDisconnectHandler = () => {
  const { mutateAsync: disconnect } = useDisconnectWallet();
  const { setIsAuthenticated } = useWallet();
  const { setAssets } = useUserAssetsStore();
  const { setAssets: setNdlpAssets } = useNdlpAssetsStore();

  useEffect(() => {
    setWalletDisconnectHandler(async () => {
      try {
        await disconnect();
        setIsAuthenticated(false);
        setAssets([]);
        setNdlpAssets([]);

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("current-address");
        localStorage.removeItem("whitelisted_address");
        localStorage.removeItem("last_wallet");
      } catch (error) {
        const walletConnectionInfo = JSON.parse(
          localStorage.getItem("sui-dapp-kit:wallet-connection-info") || "{}"
        );
        console.error("Error disconnecting wallet:", error);
        Sentry.captureException(error, {
          extra: {
            wallet_address:
              walletConnectionInfo?.state?.lastConnectedAccountAddress,
          },
        });
        localStorage.clear();
        location.reload();
        return;
      }
    });
  }, [disconnect, setIsAuthenticated, setAssets, setNdlpAssets]);
};

const ConfigWrapper = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const { error, data } = useGetDepositVaults();
  const vaultIds = data?.map((vault) => vault.vault_id) || [];
  useFetchAssets();
  useFetchNDLPAssets(data);
  useGetAllVaults(vaultIds);
  useSetWalletDisconnectHandler();
  // Prefetch critical images for better UX
  useCriticalImagePrefetch();
  useStableAutoConnect();
  useMockAutoConnect();

  useEffect(() => {
    const walletConnectionInfo = JSON.parse(
      localStorage.getItem("sui-dapp-kit:wallet-connection-info") || "{}"
    );
    const lastConnectedAccountAddress =
      walletConnectionInfo?.state?.lastConnectedAccountAddress;

    if (lastConnectedAccountAddress) {
      Sentry.setUser({
        wallet_address: lastConnectedAccountAddress,
      });
    }
  }, []);

  useEffect(() => {
    if (error) {
      Sentry.captureException(error);
      toast({
        title: error?.message || "Failed to fetch vaults",
        variant: "error",
        duration: 5000,
        icon: <IconErrorToast />,
      });
    }
  }, [error, toast]);

  return <>{children}</>;
};

// Create query client that still loads data but doesn't show loading states
const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

const App = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsWalletConnected(true);
    }, 1000);
  }, []);

  const slushWallet = useMemo(() => {
    if (isMobileDevice() || !isWalletConnected) return undefined;
    return {
      name: "NODO AI Vaults",
    };
  }, [isWalletConnected]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<GlobalLoading />}>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider
            networks={networkConfig}
            defaultNetwork={"mainnet"}
          >
            <WalletProvider autoConnect slushWallet={slushWallet}>
              <ConfigWrapper>
                <TooltipProvider delayDuration={0}>
                  <Toaster />
                  {/* <VersionChecker /> */}
                  <BrowserRouter>
                    <ScrollToTop />
                    <ScrollToTopButton />
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <MainLayout>
                            <Home />
                          </MainLayout>
                        }
                      />
                      <Route
                        path="/vault/:vault_id"
                        element={
                          <MainLayout>
                            <VaultDetail />
                          </MainLayout>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </ConfigWrapper>
            </WalletProvider>
          </SuiClientProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
