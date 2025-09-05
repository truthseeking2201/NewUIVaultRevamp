import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Web3Button from "@/components/ui/web3-button";
import {
  useNdlpAssetsStore,
  useRefreshAssetsBalance,
  useUserAssetsStore,
  useWallet,
} from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/number";
import { truncateStringWithSeparator } from "@/utils/helpers";
import { triggerWalletDisconnect } from "@/utils/wallet-disconnect";
import { motion } from "framer-motion";
import { RefreshCw, Wallet } from "lucide-react";
import { memo, useEffect, useState, useMemo } from "react";
import { ConnectWalletModal } from "./connect-wallet-modal";
import { useQueryClient } from "@tanstack/react-query";
import { SUI_CONFIG, USDC_CONFIG } from "@/config";
import ConditionRenderer from "../shared/condition-renderer";
import useBreakpoint from "@/hooks/use-breakpoint";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { WALLETS } from "./constants";
import { NdlpTokens } from "./ndlp-tokens";
import { CollateralTokens } from "./collateral-tokens";
import { Copy } from "@/assets/icons";
import DisconnectWalletIcon from "@/assets/icons/disconnect-wallet.svg";
import { sleep } from "@/lib/utils";

const DISPLAY_TOKENS = [USDC_CONFIG.coinType, SUI_CONFIG.coinType];

export const ConnectWalletButton = memo(() => {
  const { toast } = useToast();
  const [showPulse, setShowPulse] = useState(false);
  const walletConnectionInfo = JSON.parse(
    localStorage.getItem("sui-dapp-kit:wallet-connection-info") || "{}"
  );

  const [riskAssessmentTime, setRiskAssessmentTime] = useState<string>("");
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const {
    isConnectWalletDialogOpen,
    openConnectWalletDialog,
    closeConnectWalletDialog,
    isAuthenticated,
    isConnected,
    address,
  } = useWallet();
  const { currentWallet } = useCurrentWallet();

  const walletIcon = useMemo(() => {
    return WALLETS.find((w) => w.name === currentWallet?.name)?.icon ||
    currentWallet?.icon;
  }, [currentWallet]);

  const { assets } = useUserAssetsStore();
  const { refreshAllBalance } = useRefreshAssetsBalance();
  const { isMd } = useBreakpoint();
  // get first for now due to we support usdc only
  const collateralToken = useMemo(() => assets.find(
    (asset) => asset.coin_type === USDC_CONFIG.coinType
  ), [assets]);


  useEffect(() => {
    // Update risk assessment time
    const date = new Date();
    setRiskAssessmentTime(
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    // Set pulse animation on button when first connecting
    if (isAuthenticated) {
      setShowPulse(true);
      const timer = setTimeout(() => {
        setShowPulse(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const formatAddress = (address: string) => {
    return truncateStringWithSeparator(address, 13, "...", 5);
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast({
        variant: "success",
        title: "Address copied",
        description: "Wallet address copied to clipboard",
        duration: 2000,
      });
    }
  };

  const refreshWalletData = async () => {
    // Simulate refresh with animation
    setLastRefreshTime(Date.now());
    refreshAllBalance();
    await sleep(1000);
    toast({
      variant: "success",
      title: "Wallet refreshed",
      description: "Latest wallet data loaded",
      duration: 2000,
    });
  };

  return (
    <>
      {!isAuthenticated ? (
        <motion.div
          initial={{ opacity: 0.9, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Web3Button
            onClick={openConnectWalletDialog}
            data-wallet-connect="true"
            className="flex items-center gap-1"
          >
            <Wallet className="mr-1 h-4 w-4" /> Connect Wallet
          </Web3Button>
        </motion.div>
      ) : (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <ConditionRenderer
                when={isMd}
                fallback={
                  <div className="rounded-md bg-[#1B1B1B] p-2">
                    {walletIcon ? (
                      <img
                        src={walletIcon}
                        alt="wallet-icon"
                        className="w-5 h-5"
                      />
                    ) : (
                      <Wallet className="mr-1 h-4 w-4" />
                    )}
                  </div>
                }
              >
                <Button
                  variant="outline"
                  className="border-white/20 bg-gradient-to-r from-white/[0.07] to-white/[0.03] backdrop-blur-sm hover:bg-white/10 transition-all  px-3 relative overflow-hidden h-11"
                >
                  <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
                  {showPulse && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border border-nova"
                      animate={{
                        opacity: [1, 0],
                        scale: [1, 1.1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: 2,
                        repeatType: "loop",
                      }}
                    />
                  )}
                  <div className="flex items-center">
                    <span className="font-mono mr-2">
                      {formatAddress(address || "")}
                    </span>
                    <div className="hidden sm:flex items-center text-white/80 bg-white/10 px-2 py-0.5 rounded-full text-xs">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"
                      />

                      <span className="font-mono text-sm">
                        {formatNumber(1000000, 0, 2)} {collateralToken?.display_name || "USDC"}
                      </span>
                    </div>
                  </div>
                </Button>
              </ConditionRenderer>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[340px] p-0 rounded-xl border border-white/10 bg-[#121620]/95 shadow-xl backdrop-blur-xl overflow-hidden"
          >
            <div className="relative">
              {/* Decorative gradient background */}
              <div className="absolute inset-0 opacity-50 pointer-events-none overflow-hidden">
                <div className="absolute -top-[100px] -right-[100px] w-[250px] h-[250px] rounded-full bg-nova/10 blur-[80px]" />
                <div className="absolute -bottom-[100px] -left-[100px] w-[250px] h-[250px] rounded-full bg-violet-500/10 blur-[80px]" />
              </div>

              {/* Content */}
              <div className="relative flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg width="0" height="0">
                        <defs>
                          <linearGradient
                            id="wallet-gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#FFE8C9" />
                            <stop offset="25%" stopColor="#F9F4E9" />
                            <stop offset="60%" stopColor="#E3F6FF" />
                            <stop offset="100%" stopColor="#C9D4FF" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <img
                        src={walletIcon}
                        alt="wallet-icon"
                        className="w-6 h-6"
                      />

                      <span className="font-mono text-[15px] font-medium text-white/80 block truncate ml-2 mr-3">
                        {formatAddress(address || "")}
                      </span>

                      <Copy
                        className="inline-block h-4 w-4 cursor-pointer"
                        onClick={handleCopyAddress}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full hover:bg-white/10 border border-white/20"
                        onClick={refreshWalletData}
                      >
                        <motion.div
                          key={lastRefreshTime}
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                          }}
                        >
                          <RefreshCw
                            size={14}
                            style={{
                              stroke: "url(#wallet-gradient)",
                            }}
                          />
                        </motion.div>
                      </Button>
                      <div
                        className="rounded-full hover:bg-white/10 h-8 w-8 flex items-center justify-center cursor-pointer border border-white/20"
                        onClick={() => {
                          triggerWalletDisconnect();
                        }}
                      >
                        <img
                          src={DisconnectWalletIcon}
                          alt="disconnect-wallet"
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Balances */}
                  <CollateralTokens />
                  <NdlpTokens />

                  {/* Disconnect Button */}
                  {/* <Button
                    variant="web3"
                    size="sm"
                    onClick={() => {
                      triggerWalletDisconnect();
                    }}
                    className="w-full h-[40px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Disconnect</span>
                  </Button> */}
                </div>

                {/* Status Footer */}
                {/* <div className="text-[10px] border-t border-white/10 p-2 text-white/40 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>Secure Connection</span>
                  </div>
                  <div>Last checked: {riskAssessmentTime}</div>
                </div> */}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* New Connect Wallet Modal */}
      <ConnectWalletModal
        open={isConnectWalletDialogOpen}
        onClose={closeConnectWalletDialog}
      />
    </>
  );
});
