import gradientLink from "@/assets/icons/gradient-arrow-link.svg";
import successAnimationData from "@/assets/lottie/circle_checkmark_success.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import Web3Button from "@/components/ui/web3-button";
import useBreakpoint from "@/hooks/use-breakpoint";
import { formatAmount } from "@/lib/utils";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { truncateBetween } from "@/utils/truncate";
import Lottie from "lottie-react";
import { METHOD_DEPOSIT } from "../../constant";
import DepositMethod from "../deposit-method";
import { DualDepositSuccessData } from "./dual-deposit-form";
import { DepositDialogContent, DepositDialogHeader } from "./modal-dialog";
import ModalRow from "./modal-row";
import TransactionFee from "./transaction-fee";
import ModalVaultInfo from "./modal-vault-info";
import NdlpTutorial from "./ndlp-tutorial";

interface DepositModalProps {
  vault: BasicVaultDetailsType;
  isOpen: boolean;
  depositStep: number;
  onOpenChange: () => void;
  onDeposit?: () => void;
  onDepositSuccess?: () => void;
  onDone?: () => void;
  ndlpAmount: number;
  loading: boolean;
  depositSuccessData?: DualDepositSuccessData;
  tokenA: {
    amount: string;
    decimals: number;
    symbol: string;
  };
  tokenB: {
    amount: string;
    decimals: number;
    symbol: string;
  };
}

const GradientText = ({ text }: { text: string }) => {
  return (
    <span
      style={{
        background:
          "linear-gradient(90deg, #FFE8C9 0%, #F9F4E9 25%, #E3F6FF 60%, #C9D4FF 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
      className="font-bold text-base font-mono"
    >
      {text}
    </span>
  );
};

const Deployment = () => {
  return (
    <ModalRow
      label="Deployment"
      value="Instant (no DCA)"
    />
  );
};

const Amount = ({
  tokenA,
  tokenB,
}: {
  tokenA: { amount: string; decimals: number; symbol: string };
  tokenB: { amount: string; decimals: number; symbol: string };
}) => {
  const { symbol: tokenAName = "" } = tokenA;
  const { symbol: tokenBName = "" } = tokenB;

  const formattedTokenA = formatAmount({
    amount: tokenA.amount,
    precision: tokenA.decimals || 6,
    stripZero: true,
  });

  const formattedTokenB = formatAmount({
    amount: tokenB.amount,
    precision: tokenB.decimals || 6,
    stripZero: true,
  });

  return (
    <ModalRow
      label="Amount"
      className="items-start"
      value={
        <div>
          <div className="font-mono text-sm md:text-lg text-white mb-2 flex items-center justify-end gap-1">
            <img
              src={`/coins/${tokenAName?.toLowerCase()}.png`}
              alt={tokenAName}
              className="w-6 h-6 mr-1"
            />
            {formattedTokenA} {tokenAName}
          </div>
          <div className="font-mono text-sm md:text-lg text-white flex items-center justify-end gap-1">
            <img
              src={`/coins/${tokenBName?.toLowerCase()}.png`}
              alt={tokenBName}
              className="w-6 h-6 mr-1"
            />
            {formattedTokenB} {tokenBName}
          </div>
        </div>
      }
    />
  );
};

const DepositDualModal = (props: DepositModalProps) => {
  const {
    isOpen,
    depositStep,
    onOpenChange,
    onDeposit,
    onDone,
    ndlpAmount,
    depositSuccessData,
    loading,
    tokenA,
    tokenB,
    vault,
  } = props;
  const { isMd } = useBreakpoint();
  const formattedNdlp = formatAmount({
    amount: ndlpAmount,
    precision: 6,
    stripZero: true,
  });

  const suiScanUrl = `https://suiscan.xyz/${
    import.meta.env.VITE_SUI_NETWORK
  }/tx/${depositSuccessData?.digest}`;

  const handleDeposit = () => {
    onDeposit();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DepositDialogContent depositStep={depositStep}>
        <DepositDialogHeader
          depositStep={depositStep}
          onOpenChange={onOpenChange}
        />
        {depositStep === 1 && (
          <div className="flex flex-col gap-2 p-4 border border-white/15 rounded-xl bg-white/5">
            <ModalVaultInfo
              poolName={vault?.pool?.pool_name}
              valutName={vault?.vault_name}
              exchangeId={vault?.exchange_id}
            />
            <Amount
              tokenA={tokenA}
              tokenB={tokenB}
            />
            <ModalRow
              label="Deposit Method"
              value={<DepositMethod method={METHOD_DEPOSIT.DUAL} />}
            />
            <div className="border-t border-white/15 my-2" />
            <Deployment />
            <TransactionFee />
            <div className="border-t border-white/15 my-2" />
            <ModalRow
              label="Est. Max Receive"
              value={
                <div className="font-mono font-bold text-sm md:text-lg flex items-center gap-1">
                  <img
                    src="/coins/ndlp.png"
                    alt="NDLP"
                    className="w-6 h-6 mr-1"
                  />
                  {formattedNdlp} NDLP
                </div>
              }
            />
          </div>
        )}
        {depositStep === 2 && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 justify-center items-center md:mb-4 mb-3">
              <Lottie
                animationData={successAnimationData}
                loop={false}
                autoplay={true}
                className="w-8 h-8 max-md:w-10 max-md:h-10"
              />
              <div className="text-center text-lg md:text-xl font-bold">
                Deposit Successful!
              </div>
            </div>
            <div className="flex flex-col gap-3 p-4 border border-white/15 rounded-lg bg-white/5">
              <ModalVaultInfo
                poolName={vault?.pool?.pool_name}
                valutName={vault?.vault_name}
                exchangeId={vault?.exchange_id}
              />
              <Amount
                tokenA={{
                  ...tokenA,
                  amount:
                    depositSuccessData?.actualInputAmountTokenA?.toString(),
                }}
                tokenB={{
                  ...tokenB,
                  amount:
                    depositSuccessData?.actualInputAmountTokenB?.toString(),
                }}
              />
              <ModalRow
                label="Deposit Method"
                value={<DepositMethod method={METHOD_DEPOSIT.DUAL} />}
              />
              <ModalRow
                label="TxHash"
                value={
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <img
                      src={gradientLink}
                      alt="Gradient Link"
                      className="w-4 h-4"
                    />

                    <a
                      href={suiScanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#9CA3AF] hover:underline transition duration-300"
                    >
                      <GradientText
                        text={`${truncateBetween(
                          depositSuccessData?.digest || "",
                          6,
                          4
                        )}`}
                      />
                    </a>
                  </div>
                }
              />
              <div className="border-t border-white/15 my-2" />
              <Deployment />
              <TransactionFee />
              <div className="border-t border-white/15 my-2" />
              <div
                className="flex items-center justify-between p-2 rounded-lg"
                style={{
                  background:
                    "linear-gradient(87deg, rgba(157, 235, 255, 0.22) -0.54%, rgba(0, 255, 94, 0.22) 97.84%)",
                }}
              >
                <div className="font-mono text-sm md:text-base font-medium flex items-center gap-1">
                  NDLP Received
                </div>
                <div className="flex items-center gap-1">
                  <img
                    src="/coins/ndlp.png"
                    alt="NDLP"
                    className="w-6 h-6 mr-1"
                  />
                  <span className="font-mono font-bold text-sm md:text-lg text-white">
                    {formatAmount({
                      amount: depositSuccessData?.ndlpReceived,
                      precision: vault.vault_lp_token_decimals,
                      stripZero: true,
                    })}{" "}
                    NDLP
                  </span>
                </div>
              </div>
            </div>

            <NdlpTutorial />
          </div>
        )}
        <DialogFooter>
          {depositStep === 1 && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={onOpenChange}
                variant="outline"
                size={isMd ? "lg" : "default"}
                className="w-[50%] bg-white/5 max-md:h-[40px] max-md:text-sm max-md:rounded-lg"
              >
                Back
              </Button>
              <Web3Button
                onClick={handleDeposit}
                className="md:w-full md:text-base text-sm max-sm:text-xs rounded-lg max-md:h-[40px] w-[50%]"
                loading={loading}
                hideContentOnLoading={loading && !isMd}
              >
                Confirm Deposit
              </Web3Button>
            </div>
          )}
          {depositStep === 2 && (
            <div className="w-full max-md:pb-4">
              <Web3Button
                onClick={onDone}
                className="w-full rounded-lg font-semibold text-base py-3 max-md:h-[40px]"
              >
                Done
              </Web3Button>
            </div>
          )}
        </DialogFooter>
      </DepositDialogContent>
    </Dialog>
  );
};

export default DepositDualModal;
