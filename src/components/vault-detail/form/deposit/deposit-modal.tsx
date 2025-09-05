import gradientLink from "@/assets/icons/gradient-arrow-link.svg";
import successAnimationData from "@/assets/lottie/circle_checkmark_success.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import Web3Button from "@/components/ui/web3-button";
import useBreakpoint from "@/hooks/use-breakpoint";
import { formatAmount } from "@/lib/utils";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { truncateBetween } from "@/utils/truncate";
import Lottie from "lottie-react";
import { METHOD_DEPOSIT } from "../../constant";
import DepositMethod from "../deposit-method";
import { DepositSuccessData } from "./deposit-form";
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
  confirmData: {
    amount: number;
    ndlp: number;
    conversionRate: number;
  };
  loading: boolean;
  depositSuccessData?: DepositSuccessData;
  collateralToken: {
    symbol: string;
    decimals: number;
  };
  slippage: string;
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

const Slippage = ({ slippage }: { slippage: string }) => {
  return (
    <ModalRow
      label="Slippage"
      value={`${slippage}%`}
    />
  );
};

const Deployment = () => {
  return (
    <ModalRow
      label={
        <LabelWithTooltip
          hasIcon={true}
          asChild
          label="Deployment"
          iconClassName="mt-0"
          labelClassName="text-base font-sans text-[#9CA3AF] max-md:text-sm"
          tooltipContent={
            <div className="text-xs font-sans text-white/80">
              Your single-token deposit is released in small batches to cut
              slippage:
              <ul className="list-disc ml-8 mt-2">
                <li>
                  &lt; <span className="font-bold">15 % of vault TVL</span>:
                  deployed over <span className="font-bold">24-36h</span>
                </li>
                <li>
                  ≥ <span className="font-bold">15 % of vault TVL</span>:
                  deployed over an extended{" "}
                  <span className="font-bold">48-60h</span> window
                </li>
              </ul>
              <div className="text-xs mt-2">
                When the timeline ends, any idle balance is auto-swapped and
                fully added to the pool
              </div>
            </div>
          }
        />
      }
      value="Via DCA. For 48-60h"
    />
  );
};

const Amount = ({
  amount,
  collateralToken,
}: {
  amount: number;
  collateralToken: { symbol: string; decimals: number };
}) => {
  const { symbol: collateralTokenName = "" } = collateralToken;
  const formattedAmount = formatAmount({
    amount: amount,
    precision: collateralToken?.decimals || 6,
    stripZero: true,
  });
  return (
    <ModalRow
      label="Amount"
      value={`${formattedAmount} ${collateralTokenName}`}
    />
  );
};

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
    collateralToken,
    vault,
    slippage,
  } = props;

  const { isMd } = useBreakpoint();
  const { symbol: collateralTokenName = "" } = collateralToken;
  const { amount, ndlp } = confirmData;

  const formattedNdlp = formatAmount({
    amount: ndlp,
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
              amount={amount}
              collateralToken={collateralToken}
            />
            <ModalRow
              label="Conversion Rate"
              value={
                <span className="font-mono text-sm md:text-lg text-white">
                  1 {collateralTokenName} ={" "}
                  {formatAmount({
                    amount: confirmData?.conversionRate,
                    precision: vault?.vault_lp_token_decimals || 6,
                  })}{" "}
                  NDLP
                </span>
              }
            />
            <ModalRow
              label="Deposit Method"
              value={<DepositMethod method={METHOD_DEPOSIT.SINGLE} />}
            />
            <div className="border-t border-white/15 my-2" />
            <Deployment />
            <Slippage slippage={slippage} />
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
            <div className="flex max-md:flex-col gap-2 justify-center items-center mb-3 md:mb-4">
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
                amount={amount}
                collateralToken={collateralToken}
              />
              <ModalRow
                label="Deposit Method"
                value={<DepositMethod method={METHOD_DEPOSIT.SINGLE} />}
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
              <Slippage slippage={slippage} />
              <TransactionFee />
              <div className="border-t border-white/15 my-2" />
              <div
                className="flex items-center justify-between p-2 rounded-lg mt-1"
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
                      amount: depositSuccessData?.depositLpAmount,
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

export default DepositModal;
