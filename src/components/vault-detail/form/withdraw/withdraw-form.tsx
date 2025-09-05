import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import debounce from "lodash-es/debounce";
import BigNumber from "bignumber.js";

import SummaryConfirmWithdraw from "./summary-confirm-withdraw";
import { Button } from "@/components/ui/button";
import Web3Button from "@/components/ui/web3-button";
import TransactionFee from "./transaction-fee";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input-v2";
import { Info, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import SelectTokens from "./select-tokens";
import AmountToken from "./amount-token";
import ConversationRate from "../conversation-rate";
import SelectMethod from "../select-method";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { showFormatNumber, isDevBalEnabled, DEV_BAL } from "@/lib/number";
import { SymbolTokenIcon } from "@/components/shared/token-icons";
import LpType from "@/types/lp.type";
import PaymentTokenType from "@/types/payment-token.types";
import {
  useWithdrawVaultConfig,
  useWithdrawVault,
  useWithdrawEtsAmountReceive,
} from "@/hooks/use-withdraw-vault";
import { useWallet } from "@/hooks/use-wallet";
import Lottie from "lottie-react";
import successAnimationData from "@/assets/lottie/circle_checkmark_success.json";

import { METHOD_DEPOSIT } from "@/components/vault-detail/constant";

type Props = {
  balanceLp: string;
  rateLpUsd: string;
  lockDuration: number;
  lpData: LpType;
  tokens: PaymentTokenType[];
  onSuccess: (dataClaim?: any) => void;
};
interface IFormInput {
  amount: number;
}

export default function WithdrawForm({
  balanceLp,
  rateLpUsd,
  lpData,
  tokens,
  lockDuration,
  onSuccess,
}: Props) {
  const min_amount = 0.01;
  const max_decimals = 6;
  const [timeCoolDown, setTimeCoolDown] = useState<string>("");
  const [form, setForm] = useState<IFormInput>();
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [openModalSuccess, setOpenModalSuccess] = useState(false);
  const [pendingClaimData, setPendingClaimData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<PaymentTokenType>();
  const [method, setMethod] = useState(METHOD_DEPOSIT.SINGLE);

  const BadgeCoolDown = useMemo(() => {
    return (
      <p className="m-0 text-white/70 font-normal md:text-xs text-10px max-md:leading-3 text-center">
        After confirming your withdrawal, please wait{" "}
        <span className="text-apr-gradient font-black">{timeCoolDown}</span> for
        processing. Once ready, you can claim your funds back to your wallet.
      </p>
    );
  }, [timeCoolDown]);

  const balanceInput = useMemo(() => {
    return (
      <span className="text-white/80 text-sm font-medium font-sans">
        {showFormatNumber(balanceLp, 0, max_decimals, "", true)}{" "}
        {lpData.lp_symbol}
      </span>
    );
  }, [balanceLp, lpData.lp_symbol]);

  const balanceInputUsd = useMemo(() => {
    const amount = new BigNumber(rateLpUsd)
      .multipliedBy(form?.amount || "0")
      .toString();
    return (
      <span className="text-white/50 text-sm font-medium font-sans">
        {showFormatNumber(amount, 0, 2, "$")}
      </span>
    );
  }, [rateLpUsd, form]);

  const rightInput = useMemo(() => {
    return (
      <div className="flex items-center">
        <SymbolTokenIcon symbol={lpData.lp_symbol} className="md:w-6 md:h-6 mr-2 w-5 h-5" />
        <span className="font-mono text-sm md:text-lg font-bold text-gray-200">{lpData.lp_symbol}</span>
      </div>
    );
  }, [lpData]);

  const tokenReceives = useMemo(() => {
    return method === METHOD_DEPOSIT.SINGLE
      ? [selectedToken]
      : lpData.receive_tokens;
  }, [method, lpData.receive_tokens, selectedToken]);

  /**
   * HOOKS
   */
  const {
    control,
    watch,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IFormInput>({ mode: "all" });
  const { address } = useWallet();
  const { withdraw } = useWithdrawVault();
  const { configVault } = useWithdrawVaultConfig(lpData);
  const summary = useWithdrawEtsAmountReceive(
    lpData,
    form?.amount || 0,
    tokenReceives
  );

  /**
   * FUNCTION
   */
  const onSubmit = (data) => {
    setForm(data);
    setOpenModalConfirm(true);
  };

  const onCloseModalConfirm = useCallback(() => {
    if (isLoading) return;
    setOpenModalConfirm(false);
  }, [isLoading]);

  const onCloseModalSuccess = () => {
    setOpenModalSuccess(false);
    reset();
    onSuccess(pendingClaimData || undefined);
    setPendingClaimData(null);
  };

  const handleFormChange = useCallback((data: IFormInput) => {
    setForm(data);
  }, []);

  const onWithdraw = useCallback(async () => {
    setIsLoading(true);
    const res = await withdraw(form.amount, lpData, tokenReceives);
    if (res) {
      setOpenModalSuccess(true);
      onCloseModalConfirm();
      const dataClaim = {
        timeUnlock: Date.now() + 20000, // ~20s cooldown
        isClaim: false,
        tokenWithdraw: {
          token_symbol: lpData.lp_symbol,
          token_address: lpData.lp_coin_type,
          decimal: lpData.lp_decimals,
          image: lpData.lp_image,
          amount: form.amount,
        },
        tokenReceives: (tokenReceives || []).map((t) => ({
          ...t,
          amount:
            summary?.receives?.find((r) => r.token_address === t.token_address)
              ?.amount || 0,
        })),
        conversionRate: {
          from_symbol: summary?.conversion_rate?.from_symbol || lpData.lp_symbol,
          to_symbol:
            summary?.conversion_rate?.to_symbol ||
            (tokenReceives?.[0]?.token_symbol || "USDC"),
          rate: summary?.conversion_rate?.amount || 1,
        },
        configLp: lpData,
      };
      setPendingClaimData(dataClaim);
    }
    setIsLoading(false);
  }, [form, lpData, tokenReceives, onCloseModalConfirm, withdraw]);

  /**
   * LIFECYCLES
   */

  useEffect(() => {
    const duration = Math.floor(Number(lockDuration));
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration - hours * 3600) / 60);
    const getText = (num) => (num == 1 ? "" : "s");
    if (hours > 0) {
      setTimeCoolDown(`5 mins to ${hours} hour${getText(hours)}`);
    } else if (minutes > 0) {
      if (minutes > 5) {
        setTimeCoolDown(`5 mins to ${minutes} mins`);
      } else {
        setTimeCoolDown(`${minutes} minute${getText(minutes)}`);
      }
    } else {
      setTimeCoolDown(`${duration} second${getText(duration)}`);
    }
  }, [lockDuration]);

  useEffect(() => {
    const debouncedCb = debounce((formValue) => {
      handleFormChange(formValue);
    }, 500);

    const subscription = watch(debouncedCb);
    return () => subscription.unsubscribe();
  }, [watch, handleFormChange]);

  useEffect(() => {
    if (!tokens.length) return;
    const token_usdc = tokens.find((i) => i.token_symbol == "USDC");
    if (token_usdc) {
      setSelectedToken(token_usdc);
    } else {
      setSelectedToken(tokens[0]);
    }
  }, [tokens]);

  /**
   * RENDER
   */
  return (
    <div>
      <SelectMethod
        value={method}
        onChange={(value) => setMethod(value)}
        isEnableDual={lpData.is_enable_dual_token}
      />
      {method === METHOD_DEPOSIT.SINGLE && (
        <div
          className={`deposit_input_v2_wrapper p-4 !rounded-lg flex items-center justify-between mb-4 max-md:py-2`}
        >
          <div className="text-gray-200 font-medium	font-sans text-base max-md:text-13px">
            Select Payout Token
          </div>
          <SelectTokens
            selectedToken={selectedToken}
            tokens={tokens}
            onSelectToken={(token) => {
              setSelectedToken(token);
            }}
            title="Select Payout Token"
          />
        </div>
      )}

      {/* form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="amount"
          control={control}
          rules={{
            required: {
              value: true,
              message: "Please enter withdrawal amount",
            },
            min: {
              value: min_amount,
              message: `Minimum withdrawal is ${min_amount}`,
            },
            max: {
              value: balanceLp,
              message: `Insufficient ${lpData.lp_symbol} balance.`,
            },
            pattern: {
              value: new RegExp(`^\\d*\\.?\\d{0,${max_decimals}}$`),
              message: "Invalid withdrawal amount",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormattedNumberInput
              value={value ? `${value}` : ""}
              amountAvailable={isDevBalEnabled() ? String(DEV_BAL) : balanceLp}
              balanceInput={balanceInput}
              balanceInputUsd={balanceInputUsd}
              rightInput={rightInput}
              maxDecimals={max_decimals}
              label="Withdraw"
              onChange={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {(errors?.amount?.message || summary?.errorEstimateWithdraw) && (
          <div className="py-2 px-4 bg-red-error/20 text-red-error text-sm flex items-center break-all">
            <Info
              size={18}
              className="mr-2 flex-shrink-0	"
            />
            {errors?.amount?.message || summary?.errorEstimateWithdraw}
          </div>
        )}

        {/* Summary */}
        <div className="p-4 border border-white/20 rounded-[12px] rounded-t-none">
          <div className="mb-2">
            <LabelWithTooltip
              label="Est. Max Receive"
              labelClassName="text-sm md:text-base text-gray-400 font-sans"
              tooltipContent="Estimated amount based on current NDLP price. Final amount may vary slightly due to market conditions during processing."
            />
          </div>
          {(["degraded", "cooldown", "protective"].includes(String((import.meta as any)?.env?.NEXT_PUBLIC_DEV_STATUS)?.toLowerCase()) ? (
            <div className="text-xs text-white/80 bg-white/5 border border-white/15 rounded-md p-3">
              Estimates are temporarily unavailable while the network is unstable / in protective mode. Funds are safe.
            </div>
          ) : null)}

          {!(["degraded", "cooldown", "protective"].includes(String((import.meta as any)?.env?.NEXT_PUBLIC_DEV_STATUS)?.toLowerCase())) && (
            (() => {
              const rec = summary?.receives || [];
              let view = rec;
              if (rec.length === 2) {
                const [a, b] = rec;
                const sa = (a?.token_symbol || '').toUpperCase();
                const sb = (b?.token_symbol || '').toUpperCase();
                if (sa === sb) {
                  view = [ { ...a, token_symbol: 'SUI' }, { ...b, token_symbol: 'USDC' } ];
                } else {
                  view = rec.slice().sort((x, y) => (x.token_symbol === 'SUI' ? -1 : 1));
                }
              }
              return view.map((token, idx) => (
                <AmountToken
                  key={`amount-${idx}`}
                  amount={token?.amount}
                  token={token}
                  className={idx > 0 ? "mt-2 md:mt-4" : ""}
                  isLoading={summary.isLoadingEst}
                />
              ));
            })()
          )}

          <hr className="w-full border-t border-white/15 my-4" />
          {method === METHOD_DEPOSIT.SINGLE && (
            <ConversationRate
              className="mb-2"
              sourceToken={{ symbol: summary?.conversion_rate?.from_symbol }}
              targetToken={{ symbol: summary?.conversion_rate?.to_symbol }}
              rate={summary?.conversion_rate.amount}
              isCalculating={summary?.isLoadingEst}
              onRefresh={summary.refreshRate}
            />
          )}
          <TransactionFee />
        </div>

        <Web3Button
          type="submit"
          className="w-full font-semibold text-lg py-3 mt-4 mb-3 max-md:text-base"
          disabled={!!summary.errorEstimateWithdraw}
        >
          Withdraw
        </Web3Button>

        {BadgeCoolDown}
      </form>

      {/* modal confirm */}
      <Dialog
        open={openModalConfirm}
        onOpenChange={(isOpen) => !isOpen && onCloseModalConfirm()}
      >
        <DialogContent
          hideIconClose
          className="sm:max-w-[564px] bg-[#141517] max-md:rounded-2xl border border-white/10 gap-4 max-md:py-6 max-md:p-4"
        >
          {/* Header */}
          <DialogHeader className="flex flex-row justify-between items-center">
            <DialogTitle className="text-base md:text-xl font-bold m-0">
              Confirm Your Withdrawal
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirm Your Withdrawal
            </DialogDescription>
            <Button
              variant="icon"
              className="w-8 h-8 bg-white/5 text-gray-400 !mt-0"
              onClick={onCloseModalConfirm}
            >
              <X
                size={20}
                className="text-white"
              />
            </Button>
          </DialogHeader>
          {/* Content */}
          <SummaryConfirmWithdraw
            summary={summary}
            lpData={lpData}
            address={address}
            configVault={configVault}
            method={method}
          />
          {/* Footer */}
          <DialogFooter className="w-full flex sm:space-x-0 max-md:flex-row">
            <Button
              variant="outline"
              size="lg"
              className="font-semibold px-2 h-13 mr-4 !rounded-lg w-[120px] bg-white/5 max-md:text-xs"
              onClick={onCloseModalConfirm}
              disabled={isLoading}
            >
              Back
            </Button>
            <Web3Button
              className="flex-1 font-semibold text-md py-3 rounded-lg	flex items-center justify-center max-md:text-xs"
              onClick={onWithdraw}
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Waiting" : "Confirm Withdrawal"}
            </Web3Button>
          </DialogFooter>
          <div>{BadgeCoolDown}</div>
        </DialogContent>
      </Dialog>

      {/* modal success */}
      <Dialog
        open={openModalSuccess}
        onOpenChange={(isOpen) => !isOpen && onCloseModalSuccess()}
      >
        <DialogContent
          className="sm:max-w-[520px] bg-[#141517] border border-white/10 p-4 md:p-6 rounded-2xl gap-5"
          hideIconClose={true}
        >
          <DialogHeader className="relative">
            <div className="flex flex-col md:flex-row justify-center items-center ">
              <Lottie
                animationData={successAnimationData}
                loop={false}
                autoplay={true}
                className="w-9 h-9 max-md:w-11 max-md:h-11 mr-1"
              />
              <DialogTitle className="text-lg md:text-xl font-bold m-0 text-center">
                Withdrawal Request Confirmed!
              </DialogTitle>
            </div>
            <DialogDescription className="hidden m-0 text-center text-xs md:text-base text-gray-400">
              Your {showFormatNumber(summary?.amount)} {lpData.lp_symbol}{" "}
              withdrawal request from Vault {lpData.vault_name} has been
              confirmed. Funds will be available after the cooldown.
            </DialogDescription>
          </DialogHeader>
          <SummaryConfirmWithdraw
            summary={summary}
            lpData={lpData}
            address={address}
            configVault={configVault}
            method={method}
          />
          <Web3Button
            className="w-full font-semibold text-sm max-md:text-base py-3 rounded-lg"
            onClick={onCloseModalSuccess}
          >
            Done
          </Web3Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
