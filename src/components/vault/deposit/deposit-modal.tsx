import SuccessIcon from "@/assets/images/deposit/success.png";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import { useCurrentDepositVault } from "@/hooks";
import { formatNumber } from "@/lib/number";
import { formatAmount, formatPercentage } from "@/lib/utils";
import { UserCoinAsset } from "@/types/coin.types";
import { truncateBetween } from "@/utils/truncate";
import { ExternalLink, X } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  depositStep: number;
  onOpenChange: () => void;
  onDeposit?: () => void;
  onDepositSuccess?: () => void;
  onDone?: () => void;
  confirmData: {
    amount: number;
    apr: number;
    ndlp: number;
    conversionRate: number;
  };
  loading: boolean;
  depositSuccessData: any;
  collateralTokenName: string;
}

const DepositModal = (props: DepositModalProps) => {
  const {
    isOpen,
    depositStep,
    onOpenChange,
    onDeposit,
    onDone,
    confirmData,
    depositSuccessData,
    loading,
    collateralTokenName,
  } = props;

  const { amount, apr, ndlp, conversionRate } = confirmData;
  const currentVault = useCurrentDepositVault();
  const poolName = currentVault.pool.pool_name;
  const token1 = poolName.split("-")[0];
  const token2 = poolName.split("-")[1];

  const suiScanUrl = `https://suiscan.xyz/${
    import.meta.env.VITE_SUI_NETWORK
  }/tx/${depositSuccessData?.digest}`;

  const handleDeposit = () => {
    onDeposit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent hideIconClose>
        <DialogHeader>
          {depositStep === 1 && (
            <>
              <DialogTitle>Confirm Your Deposit</DialogTitle>
              <button
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 p-2 text-gray-400 hover:text-gray-600"
                onClick={onOpenChange}
              >
                <X size={20} className="text-white" />
              </button>
            </>
          )}
        </DialogHeader>
        <DialogDescription>
          {depositStep === 1 && (
            <div className="flex flex-col gap-2 p-4 border border-white/15 rounded-xl bg-white/5">
              <div className="flex justify-between">
                <span className="text-base text-[#9CA3AF]">Vault</span>
                <div className="flex items-center gap-2">
                  <div className="relative flex">
                    <img
                      src={`/coins/${token1?.toLowerCase()}.png`}
                      alt="deep"
                      className=" absolute right-[18px] z-0"
                    />
                    <img
                      src={`/coins/${token2?.toLowerCase()}.png`}
                      alt="deep"
                      className="w-6 h-6 z-10"
                    />
                  </div>

                  <span className="font-mono text-lg text-white">
                    {currentVault.pool.pool_name}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-base text-[#9CA3AF]">Amount</span>
                <span className="font-mono text-lg text-white">
                  {formatNumber(amount || 0)} {collateralTokenName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-base text-[#9CA3AF]">APR</span>
                <span className="font-mono text-lg text-white">
                  {formatPercentage(apr || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base text-[#9CA3AF]">
                  Conversation Rate
                </span>
                <span className="font-mono text-lg text-white">
                  1 {collateralTokenName} ={" "}
                  {formatAmount({ amount: conversionRate, precision: 6 })} NDLP
                </span>
              </div>
              <div className="border-t border-white/15 my-2" />
              <div className="flex justify-between">
                <span className="text-base text-[#9CA3AF]">You'll Receive</span>
                <div className="font-mono font-bold text-lg flex items-center gap-1">
                  <img
                    src="/coins/ndlp.png"
                    alt="NDLP"
                    className="w-6 h-6 mr-1"
                  />
                  {formatNumber(ndlp || 0)} NDLP
                </div>
              </div>
            </div>
          )}
          {depositStep === 2 && (
            <div className="flex flex-col gap-2">
              <img
                src={SuccessIcon}
                alt="Success"
                className="w-16 h-16 mx-auto"
              />
              <h3 className="text-center text-xl font-bold my-4">
                Deposit Successful!
              </h3>
              <div className="text-center text-base mb-2 text-[#9CA3AF]">
                Your deposit of {formatNumber(amount || 0)}{" "}
                {collateralTokenName} to Nodo AI Vault was successful.
              </div>
              <div className="flex flex-col gap-2 p-4 border border-white/15 rounded-lg bg-white/5">
                <div className="flex justify-between">
                  <span className="text-base text-[#9CA3AF]">Amount</span>
                  <span className="font-mono text-lg text-white">
                    {formatNumber(amount || 0)} {collateralTokenName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base text-[#9CA3AF]">APR</span>
                  <span className="font-mono text-lg text-white">
                    {formatPercentage(apr || 0)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-base text-[#9CA3AF]">
                    Conversation Rate
                  </span>
                  <span className="font-mono text-lg text-white">
                    1 {collateralTokenName} ={" "}
                    {formatAmount({ amount: conversionRate, precision: 6 })}{" "}
                    NDLP
                  </span>
                </div>

                <div className="flex justify-between p-2 border border-orange-500/20 rounded-lg bg-orange-500/10 mt-2">
                  <div className="font-mono font-bold text-xs flex items-center gap-1">
                    <img
                      src="/coins/ndlp.png"
                      alt="NDLP"
                      className="w-6 h-6 mr-1"
                    />
                    NDLP Received
                  </div>
                  <span className="font-mono font-bold text-lg text-[#FFA822]">
                    {formatAmount({
                      amount: ndlp,
                    })}{" "}
                    NDLP
                  </span>
                </div>

                <div className="flex justify-center gap-2 mt-2">
                  <ExternalLink size={16} className="text-[#9CA3AF]" />
                  <a
                    href={suiScanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9CA3AF] hover:text-white transition duration-300"
                  >
                    Tx Hash:{" "}
                    {truncateBetween(depositSuccessData?.digest || "", 6, 6)}
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogDescription>
        <DialogFooter>
          {depositStep === 1 && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={onOpenChange}
                variant="outline"
                size="lg"
                className="w-full bg-white/5"
              >
                Back
              </Button>
              <Button
                onClick={handleDeposit}
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Confirm Deposit
              </Button>
            </div>
          )}
          {depositStep === 2 && (
            <div className="w-full">
              <Button
                onClick={onDone}
                size="lg"
                variant="primary"
                className="w-full"
              >
                Done
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
