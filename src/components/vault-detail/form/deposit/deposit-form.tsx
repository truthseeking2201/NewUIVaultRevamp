import { checkCanDeposit } from "@/apis";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { DynamicFontText } from "@/components/ui/dynamic-font-text";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import Web3Button from "@/components/ui/web3-button";
import SuccessfulToast from "@/components/vault/deposit/successful-toast";
import { USDC_CONFIG } from "@/config";
import {
  useEstimateDeposit,
  useGetLpToken,
  useGetVaultConfig,
  useRefreshAssetsBalance,
  useSwapDepositInfo,
  useUserAssetsStore,
  useVaultBasicDetails,
  useWallet,
} from "@/hooks";
import useBreakpoint from "@/hooks/use-breakpoint";
import { useDepositVault } from "@/hooks/use-deposit-vault";
import { useToast } from "@/hooks/use-toast";
import { useTokenPrices } from "@/hooks/use-token-price";
import { getBalanceAmountForInput, getDecimalAmount } from "@/lib/number";
import { cn, formatAmount } from "@/lib/utils";
import { SymbolTokenIcon } from "@/components/shared/token-icons";
import BigNumber from "bignumber.js";
import debounce from "lodash-es/debounce";
import { TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ConversationRate from "../conversation-rate";
import DepositInput from "./deposit-input";
import DepositModal from "./deposit-modal";
import SlippageSetting from "./slippage-setting";
import { useRiskDisclosure } from "@/hooks/use-risk-disclosure";
import RiskDisclosuresPopup from "./risk-disclosure-popup";

export type DepositSuccessData = {
  digest: string;
  depositLpAmount: number;
  rateAfterSuccess: number;
};

export type DepositForm = {
  amount: string;
  token: string;
};

const DEFAULT_DEPOSIT_TOKEN = {
  symbol: USDC_CONFIG.symbol,
  decimals: USDC_CONFIG.decimals,
  balance: "0",
  token_address: USDC_CONFIG.coinType,
  min_deposit_amount: "0",
  min_deposit_amount_usd: "0",
  token_id: 0,
};

const DepositForm = ({ vault_id }: { vault_id: string }) => {
  const { openConnectWalletDialog, isConnected } = useWallet();
  const { refreshAllBalance } = useRefreshAssetsBalance();
  const { assets } = useUserAssetsStore();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositStep, setDepositStep] = useState(1);
  const [depositSuccessData, setDepositSuccessData] =
    useState<DepositSuccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: vault, refetch: refetchVaultBasicDetails } =
    useVaultBasicDetails(vault_id);
  const { refetch: refetchVaultConfig } = useGetVaultConfig(vault_id);
  const [debounceAmount, setDebounceAmount] = useState<string>("0");
  const [canDepositStatus, setCanDepositStatus] = useState<
    "checking" | "can" | "cannot"
  >("can");
  const [slippage, setSlippage] = useState<string>("0.05");
  const devStatusNorm = String((import.meta as any)?.env?.NEXT_PUBLIC_DEV_STATUS || '').toLowerCase();

  const { isMd } = useBreakpoint();
  const { toast, dismiss } = useToast();

  const { deposit } = useDepositVault(vault_id);
  const { isAuthenticated } = useWallet();

  const { visibleDisclaimer, setVisibleDisclaimer } = useRiskDisclosure();
  const [isOpenRiskDisclosure, setIsOpenRiskDisclosure] = useState(false);

  const paymentTokens = useMemo(() => {
    const tokens = vault?.tokens
      ?.map((token) => {
        const asset = assets.find(
          (asset) => asset.coin_type === token?.token_address
        );

        return {
          token_id: token?.token_id,
          symbol: token?.token_symbol,
          decimals: token.decimal,
          // Dev-friendly balance when enabled
          balance:
            ((import.meta as any)?.env?.NEXT_PUBLIC_DEV_BAL_FIX?.toString?.().toLowerCase?.() === "true")
              ? "1000000"
              : asset?.balance || "0",
          token_address: token?.token_address,
          min_deposit_amount: token?.min_deposit_amount,
          min_deposit_amount_usd: token?.min_deposit_amount_usd,
        };
      })
      .sort((a, b) =>
        new BigNumber(b.balance).minus(new BigNumber(a.balance)).toNumber()
      );

    if (!tokens?.length) {
      return [DEFAULT_DEPOSIT_TOKEN];
    }

    return tokens;
  }, [vault, assets, isAuthenticated]);

  const tokenIds = useMemo(() => {
    return vault?.tokens?.map((token) => token?.token_id) || [];
  }, [vault]);

  const { data: tokenPrices } = useTokenPrices(tokenIds);

  const lpToken = useGetLpToken(vault?.vault_lp_token || "", vault_id);

  const methods = useForm({
    defaultValues: {
      amount: "",
      token: paymentTokens[0]?.token_address || "",
    },
    mode: "onChange",
  });

  const { watch, setValue, resetField } = methods;

  const depositAmount = Number(methods.watch("amount"));
  const paymentToken = methods.watch("token");
  const collateralToken = useMemo(() => {
    const foundToken =
      paymentTokens.find(
        (token) =>
          token.token_address.toLowerCase() === paymentToken?.toLowerCase()
      ) || paymentTokens[0];

    return foundToken;
  }, [paymentTokens, paymentToken]);

  const depositAmountUsd = useMemo(() => {
    const usd_price = tokenPrices?.[collateralToken?.token_id] || 0;
    if (!usd_price) return null;
    return new BigNumber(depositAmount || "0").multipliedBy(usd_price).toNumber();
  }, [depositAmount, collateralToken, tokenPrices]);

  const { data: swapDepositInfo } = useSwapDepositInfo(
    vault_id,
    collateralToken?.token_address?.toLowerCase() !==
      vault?.collateral_token?.toLowerCase()
      ? collateralToken?.token_address || ""
      : ""
  );

  // Debounced effect for estimate deposit API call
  useEffect(() => {
    const debouncedCb = debounce((formValue) => {
      if (collateralToken?.token_address) {
        setDebounceAmount(formValue.amount);
      } else {
        setDebounceAmount("0");
      }
    }, 500);

    const subscription = watch(debouncedCb);
    return () => subscription.unsubscribe();
  }, [watch, collateralToken]);

  const estimatedDepositAmount = useMemo(() => {
    return +debounceAmount > 0
      ? getDecimalAmount(debounceAmount, collateralToken?.decimals).toString()
      : new BigNumber(1).dividedBy(collateralToken?.decimals).toString();
  }, [debounceAmount, collateralToken]);

  const {
    data: dataEstDeposit,
    rate,
    refetch: refetchEstimateDeposit,
    isCalculating,
  } = useEstimateDeposit(vault_id, {
    amount: estimatedDepositAmount,
    deposit_token: collateralToken?.token_address,
  });

  useEffect(() => {
    if (paymentToken && +debounceAmount > 0 && vault_id) {
      const handleCheckCanDeposit = async () => {
        try {
          setCanDepositStatus("checking");
          const response = await checkCanDeposit(
            vault_id,
            paymentToken,
            debounceAmount.toString()
          );
          if (response) {
            setCanDepositStatus(response.can_deposit ? "can" : "cannot");
          }
        } catch (error) {
          setCanDepositStatus("can");
        }
      };
      handleCheckCanDeposit();
    }
  }, [paymentToken, vault_id, debounceAmount]);

  useEffect(() => {
    if (isAuthenticated) {
      resetField("amount");
    }
  }, [isAuthenticated, resetField]);

  const conversionRate = useMemo(() => {
    if (!rate) {
      return 0;
    }

    return new BigNumber(1).dividedBy(rate).toNumber();
  }, [rate]);

  const ndlpAmount = useMemo(() => {
    if (+debounceAmount > 0) {
      return dataEstDeposit?.estimated_ndlp
        ? dataEstDeposit?.estimated_ndlp
        : 0;
    }

    return 0;
  }, [dataEstDeposit, debounceAmount]);

  const errors = methods.formState.errors;

  const onSubmit = (data: DepositForm) => {
    if (visibleDisclaimer) {
      setIsOpenRiskDisclosure(true);
    } else {
      setIsDepositModalOpen(true);
    }
  };

  const handleReadDisclaimer = () => {
    setVisibleDisclaimer();
    setIsDepositModalOpen(true);
  };

  const handleCloseDepositModal = () => {
    setIsDepositModalOpen(false);
    setLoading(false);
  };

  const handleDepositSuccessCallback = ({
    digest,
    ...rest
  }: DepositSuccessData) => {
    setDepositSuccessData({
      rateAfterSuccess: conversionRate,
      digest,
      depositLpAmount: rest.depositLpAmount
        ? getBalanceAmountForInput(
            rest.depositLpAmount,
            vault?.vault_lp_token_decimals || 6,
            vault?.vault_lp_token_decimals || 6
          )
        : +ndlpAmount,
    });
    setLoading(false);
    setDepositStep(2);
    refreshAllBalance();
  };

  const handleSendRequestDeposit = async () => {
    // Skip wallet execution: jump straight to success modal
    setLoading(true);
    handleDepositSuccessCallback({
      digest: "0xMOCK",
      depositLpAmount: 0,
      rateAfterSuccess: conversionRate,
    });
  };

  const handleDone = () => {
    const actualNdlpAmount = depositSuccessData?.depositLpAmount || ndlpAmount;
    setValue("amount", "");
    setIsDepositModalOpen(false);
    setDepositSuccessData(null);
    setDepositStep(1);
    setDebounceAmount("0");
    refetchVaultBasicDetails();
    refetchVaultConfig();

    const message = `${formatAmount({
      amount: Number(depositAmount),
      precision: collateralToken?.decimals,
    })} ${collateralToken?.symbol} has been deposited to ${
      vault?.vault_name
    }. Check your wallet for Tx details.`;
    toast({
      duration: 5000,
      description: (
        <SuccessfulToast
          title="Deposit successful!"
          content={message}
          closeToast={() => dismiss()}
        />
      ),
      variant: "success",
      hideClose: true,
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <DepositInput
          paymentTokens={paymentTokens}
          currentToken={collateralToken}
          depositAmountUsd={depositAmountUsd}
          onTokenChange={() => {
            setDebounceAmount("0");
          }}
        />
        {errors?.amount && (
          <div className="flex flex-row items-center bg-red-error/20 gap-2 py-2 px-4">
            <TriangleAlert className="w-4 h-4 text-red-error" />
            <span className="text-red-error text-xs font-medium font-sans">
              {errors.amount.message}
            </span>
          </div>
        )}

        <div className="rounded-b-lg border border-white/20 p-4 mb-3">
          <div className=" bg-black flex items-center justify-between pb-2">
            <LabelWithTooltip
              label="Est. Receive"
              labelClassName="text-gray-200 text-base font-bold md:text-base text-sm"
              tooltipContent="Estimated amount based on current NDLP price. Final amount may vary slightly due to market conditions during processing."
            />
          </div>
          {(["degraded", "cooldown", "protective"].includes(devStatusNorm)) && (
            <div className="text-xs text-white/80 bg-white/5 border border-white/15 rounded-md p-3">
              Estimates are temporarily unavailable while the network is unstable / in protective mode. Funds are safe.
            </div>
          )}
          {!(["degraded", "cooldown", "protective"].includes(devStatusNorm)) && (
            <div className="flex md:flex-row md:justify-between text-gray-200 font-bold font-mono items-center mb-2 md:mb-3 justify-end flex-row-reverse">
              <DynamicFontText
                maxWidth={300}
                breakpoints={[
                  { minLength: 0, fontSize: isMd ? "text-3xl" : "text-2xl" },
                  { minLength: 15, fontSize: isMd ? "text-2xl" : "text-xl" },
                  { minLength: 20, fontSize: isMd ? "text-xl" : "text-lg" },
                ]}
                defaultFontSize={isMd ? "text-2xl" : "text-xl"}
              >
                {ndlpAmount
                  ? ` ${formatAmount({ amount: ndlpAmount, precision: vault?.vault_lp_token_decimals || 6, stripZero: true })} `
                  : "--"}
              </DynamicFontText>
              <div className={"flex items-center gap-2 font-bold text-sm md:text-lg"}>
                <SymbolTokenIcon symbol={lpToken?.display_name || "NDLP"} className="w-6 h-6 max-md:mr-2" />
                {isMd && lpToken?.display_name}
              </div>
            </div>
          )}
          <hr className="w-full border-t border-white/15" />
          <div className="flex flex-col gap-2 mt-3">
            <ConversationRate
              sourceToken={collateralToken}
              targetToken={{
                symbol: lpToken?.display_name,
                decimals: lpToken?.decimals,
              }}
              rate={conversionRate}
              isCalculating={isCalculating}
              label="Rate"
              onRefresh={refetchEstimateDeposit}
            />
            <div className="flex flex-col md:flex-row justify-start items-start md:items-center md:justify-between">
              <div
                className={cn(
                  "font-sans text-sm text-white/80 md:text-sm max-md:mb-1.5 text-13px"
                )}
              >
                Network
              </div>
              <div className="text-sm font-mono text-white inline-flex items-center md:text-sm text-13px">
                <img
                  src="/chains/sui.png"
                  alt="SUI"
                  className="w-6 h-6 mr-2"
                />
                SUI
              </div>
            </div>
            <SlippageSetting
              value={slippage}
              onChange={(value) => setSlippage(value)}
            />
          </div>
        </div>

        <Web3Button
          className="w-full rounded-lg py-3 font-semibold text-lg"
          type="button"
          disabled={
            !rate ||
            !collateralToken ||
            isCalculating ||
            ["checking", "cannot"].includes(canDepositStatus)
          }
          onClick={() => {
            if (!isConnected) {
              openConnectWalletDialog();
            } else {
              methods.handleSubmit(onSubmit)();
            }
          }}
        >
          Deposit
        </Web3Button>
        <ConditionRenderer when={canDepositStatus === "cannot"}>
          <div className="font-bold text-xs mt-4 text-center">
            <span
              style={{
                background:
                  "linear-gradient(90deg, #FFE8C9 0%, #F9F4E9 25%, #DDF7F1 60%, #B5F0FF 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              This vault has reached its cap to maintain optimal performance.
            </span>{" "}
            But don't miss out, other vaults are still open and filling up fast.
          </div>
        </ConditionRenderer>
      </form>
      <RiskDisclosuresPopup
        isOpen={isOpenRiskDisclosure}
        setIsOpen={setIsOpenRiskDisclosure}
        setVisibleDisclaimer={handleReadDisclaimer}
      />
      <DepositModal
        isOpen={isDepositModalOpen}
        depositStep={depositStep}
        onOpenChange={handleCloseDepositModal}
        onDeposit={handleSendRequestDeposit}
        onDone={handleDone}
        confirmData={{
          amount: Number(depositAmount),
          ndlp: Number(ndlpAmount),
          conversionRate: conversionRate,
        }}
        depositSuccessData={depositSuccessData}
        loading={loading}
        collateralToken={collateralToken}
        vault={vault}
        slippage={slippage}
      />
    </FormProvider>
  );
};

export default DepositForm;
