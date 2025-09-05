import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConnectWallet, useWallets } from "@mysten/dapp-kit";
import { useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WALLETS } from "@/components/wallet/constants";
import { useLoginWallet } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { detectIsSlushApp, isMobileDevice } from "@/utils/helpers";
import { IconErrorToast } from "../ui/icon-error-toast";
import arrowBack from "@/assets/icons/arrow-back.svg";
import ConditionRenderer from "../shared/condition-renderer";
import ConnectWalletVideoModal from "./connect-wallet-video-modal";
import { useBreakpoint } from "@/hooks/use-breakpoint";

type Wallet = {
  name: string;
  icon: string;
  displayName: string;
  extensionUrl: string;
  isInstalled: boolean;
};

type WalletListProps = {
  onConnectSuccess: (address: string, resetConnection?: () => void) => void;
};

const FAIL_TO_LOGIN_MESSAGE = "Failed to verify your wallet signature.";
const FAIL_TO_OPEN_NEW_WINDOW_MESSAGE = "Failed to open new window";

const WalletList = ({ onConnectSuccess }: WalletListProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const loginWallet = useLoginWallet();
  const { toast } = useToast();
  const { isMd, isMobile } = useBreakpoint();
  const [tutorialVideoOpen, setTutorialVideoOpen] = useState(false);

  const allowWallets = useMemo(() => {
    const isSlushApp = detectIsSlushApp();

    if (isSlushApp) {
      const slushWallet = WALLETS.find((wallet) => wallet.name === "Slush");
      return slushWallet
        ? [
            {
              ...slushWallet,
              isInstalled: !!wallets.find((w) => w.name === "Slush"),
            },
          ]
        : [];
    }
    return WALLETS.filter(
      (wallet) => !isMobile || wallet.name !== "Newmoney"
    ).map((wallet) => {
      const foundWallet = wallets.find((w) => {
        return w.name === wallet.name;
      });
      return {
        ...wallet,
        name: foundWallet?.name || wallet.name,
        icon: wallet.icon || foundWallet?.icon,
        isInstalled: !!foundWallet,
      };
    }) as Wallet[];
  }, [wallets, isMobile]);

  const handleReject = () => {
    setError(null);
    setIsConnecting(false);
  };

  const handleConnect = async (selectedWallet: Wallet) => {
    try {
      setIsConnecting(true);
      setError(null);

      const foundWallet = wallets.find(
        (wallet) => wallet.name === selectedWallet.name
      );
      if (foundWallet) {
        setConnectedWallet(selectedWallet.name);
        connect(
          { wallet: foundWallet },
          {
            onSuccess: async (data) => {
              const address = data.accounts[0].address;
              const response = await loginWallet(address);
              if (!response?.success) {
                const isWindowsBlocked =
                  response.message === FAIL_TO_OPEN_NEW_WINDOW_MESSAGE;

                const failToLoginMessage = isWindowsBlocked
                  ? FAIL_TO_OPEN_NEW_WINDOW_MESSAGE
                  : FAIL_TO_LOGIN_MESSAGE;

                toast({
                  title: failToLoginMessage,
                  description: isWindowsBlocked ? (
                    <div>
                      <div className="text-sm font-normal font-sans">
                        Quick fix:
                      </div>
                      <ol className="list-decimal ml-8 mt-1">
                        <li>
                          Look for the popup blocked icon in your address bar on
                          the top right corner and click "Allow"
                        </li>
                        <li>Reload the page and try again</li>
                      </ol>
                      <div className="text-sm font-normal font-sans mt-1">
                        If the issue persists, please click{" "}
                        <a
                          href={selectedWallet.extensionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          here
                        </a>{" "}
                        to download extension for your browser
                      </div>
                    </div>
                  ) : (
                    <div>{response.message}</div>
                  ),
                  variant: "error",
                  duration: isWindowsBlocked ? 20000 : 5000,
                  icon: <IconErrorToast />,
                });
                handleReject();
                return;
              }
              localStorage.setItem("last_wallet", foundWallet.name);
              onConnectSuccess(address, () => {
                setConnectedWallet(null);
                setIsConnecting(false);
              });
            },
            onError: (error) => {
              console.error("Failed to connect wallet:", error);
              setError(
                `Failed to connect to ${selectedWallet.displayName} wallet. Please try again.`
              );
              handleReject();
            },
          }
        );
      } else {
        setIsConnecting(false);
        setError(
          `${selectedWallet.displayName} wallet is not detected. Please make sure it's installed and try again.`
        );
        window.open(selectedWallet.extensionUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError(
        `Failed to connect to ${selectedWallet.displayName} wallet. Please try again.`
      );
      handleReject();
    }
  };

  return (
    <>
      <div className={`${isMd ? "px-6" : "px-4 py-4"} space-y-4 font-sans`}>
        {error && (
          <Alert
            variant="destructive"
            className="mb-4 bg-red-500/10 border-red-500/20 text-red-400"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {allowWallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="icon"
              className={`${
                isMd ? "h-[56px]" : "h-[44px]"
              } py-4 px-2 justify-start space-x-1 hover:bg-white/5 transition-all ${
                connectedWallet === wallet.name
                  ? "bg-[#4DA1F9]/10 border-[#4DA1F9]/30"
                  : ""
              }`}
              onClick={() => handleConnect(wallet)}
              disabled={isConnecting}
            >
              <div className="h-8 w-8 rounded-full flex items-center justify-center">
                {wallet.icon && <img src={wallet.icon} alt={wallet.name} />}
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-md">{wallet.displayName}</div>
              </div>
              <div className="flex items-center gap-2">
                {!wallet.isInstalled && wallet.name !== "Binance Wallet" && (
                  <span className="text-xs px-2 py-1 text-section-description">
                    Install
                  </span>
                )}
                {connectedWallet === wallet.name && isConnecting && (
                  <Loader2 className="h-5 w-5 text-[#4DA1F9] animate-spin" />
                )}
              </div>
            </Button>
          ))}
        </div>

        <ConditionRenderer when={isMobileDevice()}>
          <div className="font-sans leading-5 text-xs p-3 rounded-lg border border-white/10 bg-[rgba(0,125,167,0.15)]">
            To connect your wallet on mobile, open the{" "}
            <span className="underline">ai.nodo.xyz</span> using the Slush,
            Phantom, Suiet, Backpack, Binance, OKX, Gate, or Bitget app's DApp
            Browser.{" "}
            <span className="text-white/60">
              Mobile browsers such as Safari and Chrome do not support wallet
              connections.
            </span>
            <hr className="bg-white/10 h-[1px] my-2" />
            <div className="text-xs flex items-center justify-between">
              Need help connecting?
              <div
                className="flex text-xs items-center gap-2 rounded-md font-sans bg-white/10 p-1 px-2 cursor-pointer"
                onClick={() => setTutorialVideoOpen(true)}
              >
                <img src={arrowBack} alt="Arrow Back" className="w-6 h-6" />
                Watch How
              </div>
            </div>
          </div>
          <ConnectWalletVideoModal
            open={tutorialVideoOpen}
            onOpenChange={() => setTutorialVideoOpen(false)}
          />
        </ConditionRenderer>
      </div>

      <div className="max-w-[280px] mx-auto pt-2 pb-4 text-center">
        {isConnecting && !connectedWallet && (
          <div className="flex items-center justify-center mb-3 text-amber-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="text-sm">Connecting...</span>
          </div>
        )}
        <span className="text-xs text-white/60 font-medium">
          By connecting your wallet, you agree to our{" "}
          <a href="#" className="hover:underline gradient-green-text font-bold">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="hover:underline gradient-green-text font-bold">
            Privacy Policy
          </a>
          .
        </span>
      </div>
    </>
  );
};

export default WalletList;
